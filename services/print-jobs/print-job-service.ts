import type { PrintJobStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/database/client";
import { createPrintJobSchema, printJobQuerySchema } from "@/features/print-jobs/schemas";
import type { CreatePrintJobInput, PrintJobQuery } from "@/features/print-jobs/schemas";
import { createAuditLog } from "@/services/audit/log";
import { estimateUploadCost } from "@/features/customer/upload-schemas";
import { requireCustomerContext } from "@/services/customer/customer-service";
import { createNotification } from "@/services/notifications/notification-service";

const CONNECTOR_SUPPORTED_MIME_TYPES = new Set(["application/pdf", "image/png", "image/jpeg", "image/webp"]);

const lifecycle: PrintJobStatus[] = [
  "DRAFT",
  "UPLOADED",
  "VALIDATING",
  "QUEUED",
  "ASSIGNED",
  "PRINTING",
  "READY",
  "OTP_GENERATED",
  "COLLECTED",
  "COMPLETED",
];

export function getPrintJobLifecycle() {
  return lifecycle;
}

export async function getCustomerDashboard() {
  const { session, organization } = await requireCustomerContext();
  const [recentJobs, activeJobs, completedJobs, unreadNotifications] = await prisma.$transaction([
    prisma.printJob.findMany({
      where: { organizationId: organization.id, customerUserId: session.userId },
      include: { files: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.printJob.count({
      where: {
        organizationId: organization.id,
        customerUserId: session.userId,
        status: { notIn: ["COMPLETED", "CANCELLED", "FAILED"] },
      },
    }),
    prisma.printJob.count({
      where: {
        organizationId: organization.id,
        customerUserId: session.userId,
        status: "COMPLETED",
      },
    }),
    prisma.customerNotification.count({
      where: { organizationId: organization.id, userId: session.userId, status: "UNREAD" },
    }),
  ]);
  return { recentJobs, activeJobs, completedJobs, unreadNotifications };
}

export async function listCustomerPrintJobs(input: PrintJobQuery) {
  const { session, organization } = await requireCustomerContext();
  const query = printJobQuerySchema.parse(input);
  const skip = (query.page - 1) * query.pageSize;
  const where = {
    organizationId: organization.id,
    customerUserId: session.userId,
    ...(query.status === "all" ? {} : { status: query.status }),
    ...(query.q ? { title: { contains: query.q, mode: "insensitive" as const } } : {}),
  };
  const [jobs, total] = await prisma.$transaction([
    prisma.printJob.findMany({
      where,
      include: { files: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: query.pageSize,
    }),
    prisma.printJob.count({ where }),
  ]);
  return {
    jobs,
    total,
    page: query.page,
    pageSize: query.pageSize,
    pageCount: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export async function getCustomerPrintJob(jobId: string) {
  const { session, organization } = await requireCustomerContext();
  return prisma.printJob.findFirst({
    where: { id: jobId, organizationId: organization.id, customerUserId: session.userId },
    include: {
      files: true,
      otpHistory: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          expiresAt: true,
          verifiedAt: true,
          revokedAt: true,
          createdAt: true,
        },
      },
      events: { orderBy: { createdAt: "asc" }, include: { actorUser: true } },
      notifications: true,
      activities: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function createCustomerPrintJob(input: CreatePrintJobInput) {
  const { session, organization } = await requireCustomerContext();
  if (!input.files?.length) throw new Error("FILE_REFERENCE_MISSING: At least one uploaded binary is required.");
  for (const file of input.files) {
    if (!file.storageKey) throw new Error("FILE_REFERENCE_MISSING: Uploaded file is missing its binary storage key.");
    if (!file.checksumSha256) throw new Error("FILE_INTEGRITY_MISSING: Uploaded file is missing its binary checksum.");
    if (!CONNECTOR_SUPPORTED_MIME_TYPES.has(file.mimeType)) throw new Error("UNSUPPORTED_FILE_TYPE: Only PDF, PNG, JPEG, and WEBP files can be printed by the connector.");
  }
  const job = await prisma.printJob.create({
    data: {
      organizationId: organization.id,
      customerUserId: session.userId,
      title: input.title,
      description: input.description || null,
      copies: input.copies,
      color: input.color,
      duplex: input.duplex,
      estimatedCost: input.estimatedCost ?? estimateUploadCost(input),
      metadata: {
        uploadConfiguration: {
          paperSize: input.paperSize,
          orientation: input.orientation,
          pageRange: input.pageRange || null,
          paperQuality: input.paperQuality,
          specialInstructions: input.specialInstructions || null,
          fileHistory: input.fileHistory || null,
        },
      },
      events: {
        create: { actorUserId: session.userId, toStatus: "DRAFT", note: "Print job drafted." },
      },
      activities: {
        create: {
          organizationId: organization.id,
          userId: session.userId,
          action: "print_job.created",
          description: `Created print job ${input.title}`,
        },
      },
      files: input.files ? {
        create: input.files.map(f => ({
          fileName: f.fileName,
          fileSize: f.fileSize,
          mimeType: f.mimeType,
          storageKey: f.storageKey,
          checksumSha256: f.checksumSha256 ?? null,
          status: "UPLOADED",
          progress: 100
        }))
      } : undefined,
    },
  });
  await createAuditLog({
    organizationId: organization.id,
    actorUserId: session.userId,
    action: "print_job.created",
    entityType: "PrintJob",
    entityId: job.id,
  });
  await createNotification({
    organizationId: organization.id,
    audience: "ORGANIZATION",
    type: "NEW_JOB",
    title: "New print job submitted",
    message: `${session.user.email} created ${job.title}.`,
    entityType: "PrintJob",
    entityId: job.id,
  });
  await createNotification({
    organizationId: organization.id,
    userId: session.userId,
    type: "NEW_JOB",
    title: "Document Submitted",
    message: `Your document "${job.title}" has been successfully submitted for printing.`,
    entityType: "PrintJob",
    entityId: job.id,
  });
  return job;
}

export async function transitionPrintJob(jobId: string, toStatus: PrintJobStatus, note?: string) {
  const { session, organization } = await requireCustomerContext();
  const current = await prisma.printJob.findFirst({
    where: { id: jobId, organizationId: organization.id, customerUserId: session.userId },
  });
  if (!current) throw new Error("Print job not found.");
  const job = await prisma.printJob.update({
    where: { id: current.id },
    data: {
      status: toStatus,
      completedAt: toStatus === "COMPLETED" ? new Date() : current.completedAt,
      collectedAt: toStatus === "COLLECTED" ? new Date() : current.collectedAt,
      events: {
        create: { actorUserId: session.userId, fromStatus: current.status, toStatus, note },
      },
      activities: {
        create: {
          organizationId: organization.id,
          userId: session.userId,
          action: "print_job.status_changed",
          description: `Print job moved from ${current.status} to ${toStatus}`,
        },
      },
    },
  });

  await createNotification({
    organizationId: organization.id,
    userId: session.userId,
    type: "JOB_STATUS_UPDATED",
    title: toStatus === "COMPLETED" ? "Printing Completed" : "Print Job Updated",
    message: toStatus === "COMPLETED" 
      ? `Success! Your document "${current.title}" has been successfully printed.` 
      : `Your job "${current.title}" is now ${toStatus.replaceAll("_", " ").toLowerCase()}.`,
    entityType: "PrintJob",
    entityId: job.id,
  });
  await createAuditLog({
    organizationId: organization.id,
    actorUserId: session.userId,
    action: "print_job.status_changed",
    entityType: "PrintJob",
    entityId: job.id,
    metadata: { fromStatus: current.status, toStatus },
  });
  return job;
}

export async function createPrintJobAction(formData: FormData) {
  "use server";
  const parsed = createPrintJobSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    copies: formData.get("copies") ?? 1,
    color: formData.get("color") === "on",
    duplex: formData.get("duplex") === "on" || formData.get("duplex") === null,
    paperSize: formData.get("paperSize") ?? "A4",
    orientation: formData.get("orientation") ?? "portrait",
    pageRange: formData.get("pageRange"),
    paperQuality: formData.get("paperQuality") ?? "standard",
    specialInstructions: formData.get("specialInstructions"),
    estimatedCost: formData.get("estimatedCost"),
    fileHistory: formData.get("fileHistory"),
  });
  if (!parsed.success) redirect("/customer/jobs/new?error=invalid_job");
  const job = await createCustomerPrintJob(parsed.data);
  redirect(`/customer/jobs/${job.id}`);
}

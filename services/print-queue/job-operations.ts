"use server";

import type { PrintJobStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/database/client";
import { assignPrinterSchema, jobOperationSchema } from "@/features/print-queue/schemas";
import {
  ORGANIZATION_PERMISSIONS,
  requireOrganizationPermission,
} from "@/services/authorization/guards";
import { createAuditLog } from "@/services/audit/log";
import { createNotification } from "@/services/notifications/notification-service";
import { generateCollectionOtp } from "@/services/print-jobs/otp-service";

async function recordOperation(
  jobId: string,
  toStatus: PrintJobStatus,
  action: string,
  note?: string,
) {
  const { session, organization } = await requireOrganizationPermission(
    action === "print_job.cancelled"
      ? ORGANIZATION_PERMISSIONS.JOB_CANCEL
      : ORGANIZATION_PERMISSIONS.QUEUE_MANAGE,
  );
  const current = await prisma.printJob.findFirst({
    where: { id: jobId, organizationId: organization.id },
  });
  if (!current) throw new Error("Print job not found.");
  const now = new Date();
  const job = await prisma.printJob.update({
    where: { id: current.id },
    data: {
      status: toStatus,
      assignedUserId: action === "print_job.accepted" ? session.userId : current.assignedUserId,
      assignedAt: action === "print_job.accepted" ? now : current.assignedAt,
      processingStartedAt: toStatus === "PRINTING" ? now : current.processingStartedAt,
      pausedAt:
        action === "print_job.paused"
          ? now
          : action === "print_job.resumed"
            ? null
            : current.pausedAt,
      readyAt: toStatus === "READY" ? now : current.readyAt,
      cancelledAt: toStatus === "CANCELLED" ? now : current.cancelledAt,
      events: {
        create: { actorUserId: session.userId, fromStatus: current.status, toStatus, note },
      },
      activities: {
        create: {
          organizationId: organization.id,
          userId: current.customerUserId,
          action,
          description: note || `Employee updated job to ${toStatus}`,
        },
      },
      notifications: {
        create: {
          organizationId: organization.id,
          userId: current.customerUserId,
          title: "Print job update",
          message: note || `Your print job is now ${toStatus.replaceAll("_", " ").toLowerCase()}.`,
        },
      },
    },
  });
  await createAuditLog({
    organizationId: organization.id,
    actorUserId: session.userId,
    action,
    entityType: "PrintJob",
    entityId: job.id,
    metadata: { fromStatus: current.status, toStatus },
  });
  await createNotification({
    organizationId: organization.id,
    userId: current.customerUserId,
    type: action === "print_job.accepted" ? "JOB_ASSIGNED" : "JOB_STATUS_UPDATED",
    title: action === "print_job.accepted" ? "Print job assigned" : "Print job status updated",
    message: note || `Your print job is now ${toStatus.replaceAll("_", " ").toLowerCase()}.`,
    entityType: "PrintJob",
    entityId: job.id,
    metadata: { fromStatus: current.status, toStatus },
  });
  return job;
}

async function parseOperation(formData: FormData) {
  const parsed = jobOperationSchema.safeParse({
    jobId: formData.get("jobId"),
    note: formData.get("note"),
  });
  if (!parsed.success) redirect("/employee/queue?error=invalid_job");
  return parsed.data;
}

export async function acceptJobAction(formData: FormData) {
  const input = await parseOperation(formData);
  await recordOperation(
    input.jobId,
    "ASSIGNED",
    "print_job.accepted",
    input.note || "Employee accepted job.",
  );
  redirect(`/employee/queue/${input.jobId}`);
}

export async function startJobAction(formData: FormData) {
  const input = await parseOperation(formData);
  await recordOperation(
    input.jobId,
    "PRINTING",
    "print_job.started",
    input.note || "Print processing started.",
  );
  redirect(`/employee/queue/${input.jobId}`);
}

export async function pauseJobAction(formData: FormData) {
  const input = await parseOperation(formData);
  await recordOperation(
    input.jobId,
    "ASSIGNED",
    "print_job.paused",
    input.note || "Print processing paused.",
  );
  redirect(`/employee/queue/${input.jobId}`);
}

export async function resumeJobAction(formData: FormData) {
  const input = await parseOperation(formData);
  await recordOperation(
    input.jobId,
    "PRINTING",
    "print_job.resumed",
    input.note || "Print processing resumed.",
  );
  redirect(`/employee/queue/${input.jobId}`);
}

export async function cancelJobAction(formData: FormData) {
  const input = await parseOperation(formData);
  await recordOperation(
    input.jobId,
    "CANCELLED",
    "print_job.cancelled",
    input.note || "Print job cancelled by employee.",
  );
  redirect(`/employee/queue/${input.jobId}`);
}

export async function markReadyAction(formData: FormData) {
  const input = await parseOperation(formData);
  await recordOperation(
    input.jobId,
    "READY",
    "print_job.ready",
    input.note || "Print job is ready for collection.",
  );
  await generateCollectionOtp(input.jobId);
  redirect(`/employee/queue/${input.jobId}?otp=generated`);
}

export async function assignPrinterAction(formData: FormData) {
  const parsed = assignPrinterSchema.safeParse({
    jobId: formData.get("jobId"),
    printerId: formData.get("printerId"),
  });
  if (!parsed.success) redirect("/employee/queue?error=invalid_printer");
  const { session, organization } = await requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.QUEUE_MANAGE,
  );
  const current = await prisma.printJob.findFirst({
    where: { id: parsed.data.jobId, organizationId: organization.id },
  });
  if (!current) throw new Error("Print job not found.");
  const job = await prisma.printJob.update({
    where: { id: current.id },
    data: {
      printerId: parsed.data.printerId,
      events: {
        create: {
          actorUserId: session.userId,
          fromStatus: current.status,
          toStatus: current.status,
          note: "Printer assigned.",
        },
      },
      activities: {
        create: {
          organizationId: organization.id,
          userId: current.customerUserId,
          action: "print_job.printer_assigned",
          description: "Employee assigned a printer to the print job.",
        },
      },
      notifications: {
        create: {
          organizationId: organization.id,
          userId: current.customerUserId,
          title: "Printer assigned",
          message: "A printer has been assigned to your print job.",
        },
      },
    },
  });
  await createAuditLog({
    organizationId: organization.id,
    actorUserId: session.userId,
    action: "print_job.printer_assigned",
    entityType: "PrintJob",
    entityId: job.id,
    metadata: { printerId: parsed.data.printerId },
  });
  await createNotification({
    organizationId: organization.id,
    userId: current.customerUserId,
    type: "JOB_STATUS_UPDATED",
    title: "Printer assigned",
    message: "A printer has been assigned to your print job.",
    entityType: "PrintJob",
    entityId: job.id,
    metadata: { printerId: parsed.data.printerId },
  });
  redirect(`/employee/queue/${job.id}`);
}

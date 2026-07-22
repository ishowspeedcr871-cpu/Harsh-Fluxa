import { redirect } from "next/navigation";
import { prisma } from "@/database/client";
import { uploadFileSchema } from "@/features/print-jobs/schemas";
import type { UploadFileInput } from "@/features/print-jobs/schemas";
import { createAuditLog } from "@/services/audit/log";
import { requireCustomerContext } from "@/services/customer/customer-service";
import { transitionPrintJob } from "@/services/print-jobs/print-job-service";

const allowedMimeTypes = new Set(["application/pdf", "image/png", "image/jpeg", "image/webp"]);

export async function addPrintJobUpload(input: UploadFileInput) {
  const { session, organization } = await requireCustomerContext();
  const job = await prisma.printJob.findFirst({
    where: {
      id: input.printJobId,
      organizationId: organization.id,
      customerUserId: session.userId,
    },
  });
  if (!job) throw new Error("Print job not found.");
  const isAllowed = allowedMimeTypes.has(input.mimeType);
  const file = await prisma.printJobFile.create({
    data: {
      printJobId: job.id,
      fileName: input.fileName,
      fileSize: input.fileSize,
      mimeType: input.mimeType,
      status: isAllowed ? "UPLOADED" : "FAILED",
      progress: isAllowed ? 100 : 0,
      validationError: isAllowed ? null : "Unsupported file type. Use PDF, PNG, JPEG, or WEBP.",
    },
  });
  await createAuditLog({
    organizationId: organization.id,
    actorUserId: session.userId,
    action: "print_job.file_uploaded",
    entityType: "PrintJobFile",
    entityId: file.id,
  });
  if (isAllowed && job.status === "DRAFT")
    await transitionPrintJob(job.id, "UPLOADED", "Customer uploaded file metadata.");
  return file;
}

export async function addPrintJobUploadAction(formData: FormData) {
  "use server";
  const parsed = uploadFileSchema.safeParse({
    printJobId: formData.get("printJobId"),
    fileName: formData.get("fileName"),
    fileSize: formData.get("fileSize"),
    mimeType: formData.get("mimeType"),
  });
  if (!parsed.success) redirect("/customer/jobs/new?error=invalid_upload");
  await addPrintJobUpload(parsed.data);
  redirect(`/customer/jobs/${parsed.data.printJobId}?uploaded=1`);
}

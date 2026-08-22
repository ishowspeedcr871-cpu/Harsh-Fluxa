import { redirect } from "next/navigation";
import { prisma } from "@/database/client";
import { uploadFileSchema } from "@/features/print-jobs/schemas";
import type { UploadFileInput } from "@/features/print-jobs/schemas";
import { createAuditLog } from "@/services/audit/log";
import { requireCustomerContext } from "@/services/customer/customer-service";
import { transitionPrintJob } from "@/services/print-jobs/print-job-service";

const allowedMimeTypes = new Set(["application/pdf", "image/png", "image/jpeg", "image/webp"]);

export async function addPrintJobUpload(input: UploadFileInput) {
  // This legacy metadata-only server action has no binary stream to put into GridFS.
  // Refuse it rather than manufacturing a printable metadata record.
  throw new Error("BINARY_UPLOAD_REQUIRED: Upload through /api/customer/jobs using multipart/form-data and a browser File.");
  /* c8 ignore start -- retained below as the historical implementation reference. */
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
      storageKey: input.storageKey,
      checksumSha256: input.checksumSha256 ?? null,
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
    await transitionPrintJob(job.id, "UPLOADED", "Customer uploaded file binary to GridFS.");
  return file;
  /* c8 ignore stop */
}

export async function addPrintJobUploadAction(formData: FormData) {
  "use server";
  const parsed = uploadFileSchema.safeParse({
    printJobId: formData.get("printJobId"),
    fileName: formData.get("fileName"),
    fileSize: formData.get("fileSize"),
    mimeType: formData.get("mimeType"),
    storageKey: formData.get("storageKey"),
    checksumSha256: formData.get("checksumSha256") || undefined,
  });
  if (!parsed.success) redirect("/customer/jobs/new?error=invalid_upload");
  await addPrintJobUpload(parsed.data);
  redirect(`/customer/jobs/${parsed.data.printJobId}?uploaded=1`);
}

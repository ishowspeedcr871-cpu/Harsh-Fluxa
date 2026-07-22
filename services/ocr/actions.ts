"use server";

import { redirect } from "next/navigation";
import { createOcrJobSchema, processOcrJobSchema } from "@/features/ocr/schemas";
import {
  ORGANIZATION_PERMISSIONS,
  requireOrganizationPermission,
} from "@/services/authorization/guards";
import { createOcrJob, processOcrJob } from "@/services/ocr/ocr-service";

export async function createOcrJobAction(formData: FormData) {
  const { session, organization } = await requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.OCR_MANAGE,
  );
  const input = createOcrJobSchema.safeParse({
    printJobFileId: formData.get("printJobFileId"),
    languageHint: formData.get("languageHint"),
    priority: formData.get("priority") ?? "NORMAL",
    timeoutMs: formData.get("timeoutMs") ?? 60000,
    maxAttempts: formData.get("maxAttempts") ?? 3,
    requestedFeatures: {
      extractText: formData.get("extractText") === "on",
      analyzeLayout: formData.get("analyzeLayout") !== "off",
      detectBlankPages: formData.get("detectBlankPages") !== "off",
      detectDuplicatePages: formData.get("detectDuplicatePages") !== "off",
      estimatePrintMetrics: formData.get("estimatePrintMetrics") !== "off",
    },
  });
  if (!input.success) redirect("/organization/ocr?error=invalid_ocr_job");
  const job = await createOcrJob(organization.id, session.userId, input.data);
  redirect(`/organization/ocr?job=${job.id}`);
}

export async function processOcrJobAction(formData: FormData) {
  const { session, organization } = await requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.OCR_MANAGE,
  );
  const input = processOcrJobSchema.safeParse({ ocrJobId: formData.get("ocrJobId") });
  if (!input.success) redirect("/organization/ocr?error=invalid_process_request");
  await processOcrJob(organization.id, session.userId, input.data);
  redirect("/organization/ocr?processed=1");
}

import { readOcrJson, handleOcrApiError } from "@/app/api/ocr/_utils";
import { createOcrJobSchema, processOcrJobSchema } from "@/features/ocr/schemas";
import {
  ORGANIZATION_PERMISSIONS,
  requireOrganizationPermission,
} from "@/services/authorization/guards";
import { createOcrJob, processOcrJob } from "@/services/ocr/ocr-service";

export async function POST(request: Request) {
  try {
    const { session, organization } = await requireOrganizationPermission(
      ORGANIZATION_PERMISSIONS.OCR_MANAGE,
    );
    const body = await readOcrJson(request);
    if (typeof body === "object" && body && "ocrJobId" in body) {
      return Response.json(
        await processOcrJob(organization.id, session.userId, processOcrJobSchema.parse(body)),
      );
    }
    return Response.json(
      await createOcrJob(organization.id, session.userId, createOcrJobSchema.parse(body)),
      { status: 201 },
    );
  } catch (error) {
    return handleOcrApiError(error);
  }
}

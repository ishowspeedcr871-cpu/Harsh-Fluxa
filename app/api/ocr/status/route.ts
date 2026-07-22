import { handleOcrApiError } from "@/app/api/ocr/_utils";
import {
  ORGANIZATION_PERMISSIONS,
  requireOrganizationPermission,
} from "@/services/authorization/guards";
import { getOcrJob } from "@/services/ocr/ocr-service";

export async function GET(request: Request) {
  try {
    const { organization } = await requireOrganizationPermission(ORGANIZATION_PERMISSIONS.OCR_READ);
    const ocrJobId = new URL(request.url).searchParams.get("ocrJobId");
    if (!ocrJobId)
      return Response.json(
        { error: { code: "VALIDATION_ERROR", message: "ocrJobId is required." } },
        { status: 422 },
      );
    return Response.json(await getOcrJob(organization.id, ocrJobId));
  } catch (error) {
    return handleOcrApiError(error);
  }
}

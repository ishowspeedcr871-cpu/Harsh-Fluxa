import { handleOcrApiError } from "@/app/api/ocr/_utils";
import { previewQuerySchema } from "@/features/ocr/schemas";
import {
  ORGANIZATION_PERMISSIONS,
  requireOrganizationPermission,
} from "@/services/authorization/guards";
import { getPreviewMetadata } from "@/services/ocr/ocr-service";

export async function GET(request: Request) {
  try {
    const { organization } = await requireOrganizationPermission(ORGANIZATION_PERMISSIONS.OCR_READ);
    const query = previewQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    return Response.json(await getPreviewMetadata(organization.id, query));
  } catch (error) {
    return handleOcrApiError(error);
  }
}

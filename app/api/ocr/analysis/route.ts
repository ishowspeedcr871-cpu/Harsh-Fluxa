import { handleOcrApiError } from "@/app/api/ocr/_utils";
import { ocrListQuerySchema } from "@/features/ocr/schemas";
import {
  ORGANIZATION_PERMISSIONS,
  requireOrganizationPermission,
} from "@/services/authorization/guards";
import { listDocumentAnalyses } from "@/services/ocr/ocr-service";

export async function GET(request: Request) {
  try {
    const { organization } = await requireOrganizationPermission(ORGANIZATION_PERMISSIONS.OCR_READ);
    const query = ocrListQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    return Response.json(await listDocumentAnalyses(organization.id, query));
  } catch (error) {
    return handleOcrApiError(error);
  }
}

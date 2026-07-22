import { handleOcrApiError } from "@/app/api/ocr/_utils";
import { requireMasterDeveloper } from "@/services/developer/platform-authorization";
import { getPlatformOcrDashboard } from "@/services/ocr/ocr-service";

export async function GET() {
  try {
    await requireMasterDeveloper({ api: true });
    return Response.json(await getPlatformOcrDashboard());
  } catch (error) {
    return handleOcrApiError(error);
  }
}

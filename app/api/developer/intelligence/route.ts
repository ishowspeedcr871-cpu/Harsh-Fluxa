import { handleIntelligenceApiError } from "@/app/api/intelligence/_utils";
import { requireMasterDeveloper } from "@/services/developer/platform-authorization";
import { getAiAnalyticsDashboard } from "@/services/intelligence/intelligence-service";

export async function GET() {
  try {
    await requireMasterDeveloper({ api: true });
    return Response.json(await getAiAnalyticsDashboard(null));
  } catch (error) {
    return handleIntelligenceApiError(error);
  }
}

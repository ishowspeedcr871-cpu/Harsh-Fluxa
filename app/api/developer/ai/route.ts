import { handleApiError } from "@/app/api/ai/_utils";
import { requireMasterDeveloper } from "@/services/developer/platform-authorization";
import { getPlatformAiDashboard } from "@/services/ai/ai-service";

export async function GET() {
  try {
    await requireMasterDeveloper({ api: true });
    return Response.json(await getPlatformAiDashboard());
  } catch (error) {
    return handleApiError(error);
  }
}

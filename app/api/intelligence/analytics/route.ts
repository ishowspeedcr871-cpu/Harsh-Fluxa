import { handleIntelligenceApiError } from "@/app/api/intelligence/_utils";
import {
  ORGANIZATION_PERMISSIONS,
  requireOrganizationPermission,
} from "@/services/authorization/guards";
import {
  captureAiAnalyticsSnapshot,
  getAiAnalyticsDashboard,
} from "@/services/intelligence/intelligence-service";

export async function GET() {
  try {
    const { organization } = await requireOrganizationPermission(
      ORGANIZATION_PERMISSIONS.INTELLIGENCE_READ,
    );
    return Response.json(await getAiAnalyticsDashboard(organization.id));
  } catch (error) {
    return handleIntelligenceApiError(error);
  }
}

export async function POST() {
  try {
    const { organization } = await requireOrganizationPermission(
      ORGANIZATION_PERMISSIONS.INTELLIGENCE_MANAGE,
    );
    return Response.json(await captureAiAnalyticsSnapshot(organization.id), { status: 201 });
  } catch (error) {
    return handleIntelligenceApiError(error);
  }
}

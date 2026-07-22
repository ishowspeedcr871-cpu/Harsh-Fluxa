import { handleIntelligenceApiError, readIntelligenceJson } from "@/app/api/intelligence/_utils";
import {
  createRecommendationSchema,
  recommendationFeedbackSchema,
} from "@/features/intelligence/schemas";
import {
  ORGANIZATION_PERMISSIONS,
  requireOrganizationPermission,
} from "@/services/authorization/guards";
import {
  createPrintAssistantRecommendation,
  listRecommendations,
  recordRecommendationFeedback,
} from "@/services/intelligence/intelligence-service";

export async function GET() {
  try {
    const { organization } = await requireOrganizationPermission(
      ORGANIZATION_PERMISSIONS.INTELLIGENCE_READ,
    );
    return Response.json(await listRecommendations(organization.id));
  } catch (error) {
    return handleIntelligenceApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { session, organization } = await requireOrganizationPermission(
      ORGANIZATION_PERMISSIONS.INTELLIGENCE_MANAGE,
    );
    const body = await readIntelligenceJson(request);
    if (typeof body === "object" && body && "recommendationId" in body)
      return Response.json(
        await recordRecommendationFeedback(
          organization.id,
          session.userId,
          recommendationFeedbackSchema.parse(body),
        ),
      );
    return Response.json(
      await createPrintAssistantRecommendation(
        organization.id,
        session.userId,
        createRecommendationSchema.parse(body),
      ),
      { status: 201 },
    );
  } catch (error) {
    return handleIntelligenceApiError(error);
  }
}

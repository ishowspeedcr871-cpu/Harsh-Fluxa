import { handleIntelligenceApiError, readIntelligenceJson } from "@/app/api/intelligence/_utils";
import { intelligentSearchSchema, savedSearchSchema } from "@/features/intelligence/schemas";
import {
  ORGANIZATION_PERMISSIONS,
  requireOrganizationPermission,
} from "@/services/authorization/guards";
import { intelligentSearch, saveSearch } from "@/services/intelligence/intelligence-service";

export async function GET(request: Request) {
  try {
    const { session, organization } = await requireOrganizationPermission(
      ORGANIZATION_PERMISSIONS.INTELLIGENCE_READ,
    );
    const query = intelligentSearchSchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    return Response.json(await intelligentSearch(organization.id, session.userId, query));
  } catch (error) {
    return handleIntelligenceApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { session, organization } = await requireOrganizationPermission(
      ORGANIZATION_PERMISSIONS.INTELLIGENCE_MANAGE,
    );
    return Response.json(
      await saveSearch(
        organization.id,
        session.userId,
        savedSearchSchema.parse(await readIntelligenceJson(request)),
      ),
      { status: 201 },
    );
  } catch (error) {
    return handleIntelligenceApiError(error);
  }
}

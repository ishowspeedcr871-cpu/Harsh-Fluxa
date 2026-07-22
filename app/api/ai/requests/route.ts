import { readJson, handleApiError } from "@/app/api/ai/_utils";
import { aiListQuerySchema, aiRequestSchema } from "@/features/ai/schemas";
import {
  ORGANIZATION_PERMISSIONS,
  requireOrganizationPermission,
} from "@/services/authorization/guards";
import { createAiRequest, listAiRequests } from "@/services/ai/ai-service";

export async function GET(request: Request) {
  try {
    const { organization } = await requireOrganizationPermission(ORGANIZATION_PERMISSIONS.AI_READ);
    const query = aiListQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    return Response.json(await listAiRequests(organization.id, query));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { session, organization } = await requireOrganizationPermission(
      ORGANIZATION_PERMISSIONS.AI_MANAGE,
    );
    const input = aiRequestSchema.parse(await readJson(request));
    return Response.json(await createAiRequest(organization.id, session.userId, input), {
      status: 202,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

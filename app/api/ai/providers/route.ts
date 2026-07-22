import { readJson, handleApiError } from "@/app/api/ai/_utils";
import { aiProviderSchema } from "@/features/ai/schemas";
import {
  ORGANIZATION_PERMISSIONS,
  requireOrganizationPermission,
} from "@/services/authorization/guards";
import { createAiProvider, getAiSettingsDashboard } from "@/services/ai/ai-service";

export async function GET() {
  try {
    const { organization } = await requireOrganizationPermission(ORGANIZATION_PERMISSIONS.AI_READ);
    return Response.json((await getAiSettingsDashboard(organization.id)).providers);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { session, organization } = await requireOrganizationPermission(
      ORGANIZATION_PERMISSIONS.AI_MANAGE,
    );
    const input = aiProviderSchema.parse(await readJson(request));
    return Response.json(await createAiProvider(organization.id, session.userId, input), {
      status: 201,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

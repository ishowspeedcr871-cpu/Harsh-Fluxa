import { readJson, handleApiError } from "@/app/api/ai/_utils";
import { aiModelSchema } from "@/features/ai/schemas";
import {
  ORGANIZATION_PERMISSIONS,
  requireOrganizationPermission,
} from "@/services/authorization/guards";
import { createAiModel, getAiSettingsDashboard } from "@/services/ai/ai-service";

export async function GET() {
  try {
    const { organization } = await requireOrganizationPermission(ORGANIZATION_PERMISSIONS.AI_READ);
    const providers = (await getAiSettingsDashboard(organization.id)).providers;
    return Response.json(providers.flatMap((provider: any) => provider.models));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { session, organization } = await requireOrganizationPermission(
      ORGANIZATION_PERMISSIONS.AI_MANAGE,
    );
    const input = aiModelSchema.parse(await readJson(request));
    return Response.json(await createAiModel(organization.id, session.userId, input), {
      status: 201,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

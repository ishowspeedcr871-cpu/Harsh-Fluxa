import { readJson, handleApiError } from "@/app/api/ai/_utils";
import { aiConfigurationSchema } from "@/features/ai/schemas";
import {
  ORGANIZATION_PERMISSIONS,
  requireOrganizationPermission,
} from "@/services/authorization/guards";
import { getAiSettingsDashboard, upsertAiConfiguration } from "@/services/ai/ai-service";

export async function GET() {
  try {
    const { organization } = await requireOrganizationPermission(ORGANIZATION_PERMISSIONS.AI_READ);
    return Response.json(await getAiSettingsDashboard(organization.id));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const { session, organization } = await requireOrganizationPermission(
      ORGANIZATION_PERMISSIONS.AI_MANAGE,
    );
    const input = aiConfigurationSchema.parse(await readJson(request));
    return Response.json(await upsertAiConfiguration(organization.id, session.userId, input));
  } catch (error) {
    return handleApiError(error);
  }
}

import { readJson, handleApiError } from "@/app/api/ai/_utils";
import {
  ORGANIZATION_PERMISSIONS,
  requireOrganizationPermission,
} from "@/services/authorization/guards";
import { checkProviderHealth, getAiSettingsDashboard } from "@/services/ai/ai-service";
import { z } from "zod";

const healthSchema = z.object({ providerId: z.string().min(1) });

export async function GET() {
  try {
    const { organization } = await requireOrganizationPermission(ORGANIZATION_PERMISSIONS.AI_READ);
    const providers = (await getAiSettingsDashboard(organization.id)).providers;
    return Response.json(providers.flatMap((provider: any) => provider.healthChecks));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { session, organization } = await requireOrganizationPermission(
      ORGANIZATION_PERMISSIONS.AI_MANAGE,
    );
    const input = healthSchema.parse(await readJson(request));
    return Response.json(
      await checkProviderHealth(input.providerId, organization.id, session.userId),
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}

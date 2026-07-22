import { handleIntelligenceApiError, readIntelligenceJson } from "@/app/api/intelligence/_utils";
import { automationExecuteSchema, automationRuleSchema } from "@/features/intelligence/schemas";
import {
  ORGANIZATION_PERMISSIONS,
  requireOrganizationPermission,
} from "@/services/authorization/guards";
import {
  createAutomationRule,
  executeAutomationRules,
  listAutomationRules,
} from "@/services/intelligence/intelligence-service";

export async function GET() {
  try {
    const { organization } = await requireOrganizationPermission(
      ORGANIZATION_PERMISSIONS.INTELLIGENCE_READ,
    );
    return Response.json(await listAutomationRules(organization.id));
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
    if (typeof body === "object" && body && "execute" in body)
      return Response.json(
        await executeAutomationRules(
          organization.id,
          session.userId,
          automationExecuteSchema.parse(body),
        ),
      );
    return Response.json(
      await createAutomationRule(organization.id, session.userId, automationRuleSchema.parse(body)),
      { status: 201 },
    );
  } catch (error) {
    return handleIntelligenceApiError(error);
  }
}

"use server";

import { redirect } from "next/navigation";
import {
  automationRuleSchema,
  createRecommendationSchema,
  intelligentSearchSchema,
  recommendationFeedbackSchema,
} from "@/features/intelligence/schemas";
import {
  ORGANIZATION_PERMISSIONS,
  requireOrganizationPermission,
} from "@/services/authorization/guards";
import {
  createAutomationRule,
  createPrintAssistantRecommendation,
  intelligentSearch,
  recordRecommendationFeedback,
} from "@/services/intelligence/intelligence-service";

export async function createRecommendationAction(formData: FormData) {
  const { session, organization } = await requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.INTELLIGENCE_MANAGE,
  );
  const input = createRecommendationSchema.safeParse({
    printJobId: formData.get("printJobId"),
    printJobFileId: formData.get("printJobFileId"),
    documentAnalysisId: formData.get("documentAnalysisId"),
  });
  if (!input.success) redirect("/organization/intelligence?error=invalid_recommendation");
  await createPrintAssistantRecommendation(organization.id, session.userId, input.data);
  redirect("/organization/intelligence?created=recommendation");
}

export async function recommendationFeedbackAction(formData: FormData) {
  const { session, organization } = await requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.INTELLIGENCE_MANAGE,
  );
  const input = recommendationFeedbackSchema.safeParse({
    recommendationId: formData.get("recommendationId"),
    accepted: formData.get("accepted") === "true",
    reason: formData.get("reason"),
  });
  if (!input.success) redirect("/organization/intelligence?error=invalid_feedback");
  await recordRecommendationFeedback(organization.id, session.userId, input.data);
  redirect("/organization/intelligence?updated=recommendation");
}

export async function createAutomationRuleAction(formData: FormData) {
  const { session, organization } = await requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.INTELLIGENCE_MANAGE,
  );
  const input = automationRuleSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    triggerType: formData.get("triggerType"),
    status: formData.get("status") ?? "ACTIVE",
    priority: formData.get("priority") ?? 100,
    rateLimitPerHour: formData.get("rateLimitPerHour") ?? 120,
    conditions: [],
    actions: [
      {
        type: formData.get("actionType") ?? "notify",
        value: formData.get("actionValue") ?? "AI automation matched.",
      },
    ],
  });
  if (!input.success) redirect("/organization/intelligence?error=invalid_rule");
  await createAutomationRule(organization.id, session.userId, input.data);
  redirect("/organization/intelligence?created=automation_rule");
}

export async function searchAction(formData: FormData) {
  const { session, organization } = await requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.INTELLIGENCE_READ,
  );
  const input = intelligentSearchSchema.safeParse({
    q: formData.get("q"),
    scope: formData.get("scope") ?? "ALL",
  });
  if (!input.success) redirect("/organization/intelligence?error=invalid_search");
  await intelligentSearch(organization.id, session.userId, input.data);
  redirect(
    `/organization/intelligence?q=${encodeURIComponent(input.data.q)}&scope=${input.data.scope}`,
  );
}

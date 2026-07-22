"use server";

import { redirect } from "next/navigation";
import { aiConfigurationSchema, aiModelSchema, aiProviderSchema } from "@/features/ai/schemas";
import {
  ORGANIZATION_PERMISSIONS,
  requireOrganizationPermission,
} from "@/services/authorization/guards";
import { createAiModel, createAiProvider, upsertAiConfiguration } from "@/services/ai/ai-service";

export async function updateAiConfigurationAction(formData: FormData) {
  const { session, organization } = await requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.AI_MANAGE,
  );
  const input = aiConfigurationSchema.safeParse({
    defaultProviderId: formData.get("defaultProviderId"),
    defaultModelId: formData.get("defaultModelId"),
    isEnabled: formData.get("isEnabled") === "on",
    streamingEnabled: formData.get("streamingEnabled") === "on",
    timeoutMs: formData.get("timeoutMs"),
    retryCount: formData.get("retryCount"),
    rateLimitPerMinute: formData.get("rateLimitPerMinute"),
    featureFlags: {
      ocr_foundation: formData.get("ocr_foundation") === "on",
      ai_chat_foundation: formData.get("ai_chat_foundation") === "on",
      print_assistant_foundation: formData.get("print_assistant_foundation") === "on",
      automation_foundation: formData.get("automation_foundation") === "on",
    },
  });
  if (!input.success) redirect("/organization/ai?error=invalid_configuration");
  await upsertAiConfiguration(organization.id, session.userId, input.data);
  redirect("/organization/ai?updated=configuration");
}

export async function createAiProviderAction(formData: FormData) {
  const { session, organization } = await requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.AI_MANAGE,
  );
  const input = aiProviderSchema.safeParse({
    key: formData.get("key"),
    name: formData.get("name"),
    status: formData.get("status") ?? "INACTIVE",
    baseUrl: formData.get("baseUrl"),
    defaultTimeoutMs: formData.get("defaultTimeoutMs"),
    defaultRetryCount: formData.get("defaultRetryCount"),
    supportsStreaming: formData.get("supportsStreaming") === "on",
  });
  if (!input.success) redirect("/organization/ai?error=invalid_provider");
  await createAiProvider(organization.id, session.userId, input.data);
  redirect("/organization/ai?created=provider");
}

export async function createAiModelAction(formData: FormData) {
  const { session, organization } = await requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.AI_MANAGE,
  );
  const input = aiModelSchema.safeParse({
    providerId: formData.get("providerId"),
    key: formData.get("key"),
    name: formData.get("name"),
    status: formData.get("status") ?? "ACTIVE",
    contextWindow: formData.get("contextWindow") || undefined,
    supportsStreaming: formData.get("supportsStreaming") === "on",
    inputModalities: ["text"],
    outputModalities: ["text"],
  });
  if (!input.success) redirect("/organization/ai?error=invalid_model");
  await createAiModel(organization.id, session.userId, input.data);
  redirect("/organization/ai?created=model");
}

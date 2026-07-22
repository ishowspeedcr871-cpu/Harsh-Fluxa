import { createHash } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/database/client";
import {
  aiConfigurationSchema,
  aiListQuerySchema,
  aiModelSchema,
  aiPromptTemplateSchema,
  aiProviderSchema,
  aiRequestSchema,
  type AiConfigurationInput,
  type AiListQuery,
  type AiModelInput,
  type AiPromptTemplateInput,
  type AiProviderInput,
  type AiRequestInput,
} from "@/features/ai/schemas";
import { AiServiceError } from "@/services/ai/errors";
import { createAiAuditLog } from "@/services/ai/audit";
import { createProviderAdapter, resolveProviderAdapter } from "@/services/ai/provider-registry";

function hashPayload(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function dayBounds(date = new Date()) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

async function enforceRateLimit(organizationId: string, limit: number) {
  const oneMinuteAgo = new Date(Date.now() - 60_000);
  const count = await prisma.aiRequest.count({
    where: { organizationId, createdAt: { gte: oneMinuteAgo } },
  });
  if (count >= limit)
    throw new AiServiceError("AI request rate limit exceeded.", "AI_RATE_LIMITED", 429);
}

export async function getAiSettingsDashboard(organizationId: string) {
  const [configuration, providers, promptTemplates, requests, usage] = await prisma.$transaction([
    prisma.aiConfiguration.findUnique({
      where: { organizationId },
      include: { defaultProvider: true, defaultModel: true },
    }),
    prisma.aiProvider.findMany({
      where: { deletedAt: null, OR: [{ organizationId }, { organizationId: null }] },
      include: {
        models: { where: { deletedAt: null } },
        healthChecks: { orderBy: { checkedAt: "desc" }, take: 1 },
      },
      orderBy: { name: "asc" },
    }),
    prisma.aiPromptTemplate.findMany({
      where: { OR: [{ organizationId }, { organizationId: null }] },
      orderBy: [{ key: "asc" }, { version: "desc" }],
      take: 20,
    }),
    prisma.aiRequest.findMany({
      where: { organizationId },
      include: { provider: true, model: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.aiUsageStatistic.findMany({
      where: { organizationId },
      include: { provider: true, model: true },
      orderBy: { periodStart: "desc" },
      take: 10,
    }),
  ]);
  return { configuration, providers, promptTemplates, requests, usage };
}

export async function upsertAiConfiguration(
  organizationId: string,
  actorUserId: string | undefined,
  input: AiConfigurationInput,
) {
  const parsed = aiConfigurationSchema.parse(input);
  if (parsed.defaultProviderId)
    await assertTenantProvider(organizationId, parsed.defaultProviderId);
  if (parsed.defaultModelId)
    await assertTenantModel(
      organizationId,
      parsed.defaultModelId,
      parsed.defaultProviderId || undefined,
    );
  const configuration = await prisma.aiConfiguration.upsert({
    where: { organizationId },
    update: {
      ...parsed,
      defaultProviderId: parsed.defaultProviderId || null,
      defaultModelId: parsed.defaultModelId || null,
      featureFlags: parsed.featureFlags as Prisma.InputJsonValue,
    },
    create: {
      organizationId,
      ...parsed,
      defaultProviderId: parsed.defaultProviderId || null,
      defaultModelId: parsed.defaultModelId || null,
      featureFlags: parsed.featureFlags as Prisma.InputJsonValue,
    },
  });
  await createAiAuditLog({
    organizationId,
    actorUserId,
    action: "ai.configuration.updated",
    metadata: { isEnabled: configuration.isEnabled },
  });
  return configuration;
}

async function assertTenantProvider(organizationId: string, providerId: string) {
  const provider = await prisma.aiProvider.findFirst({
    where: { id: providerId, deletedAt: null, OR: [{ organizationId }, { organizationId: null }] },
  });
  if (!provider)
    throw new AiServiceError(
      "AI provider is not available to this tenant.",
      "AI_PROVIDER_NOT_FOUND",
      404,
    );
  return provider;
}

async function assertTenantModel(organizationId: string, modelId: string, providerId?: string) {
  const model = await prisma.aiModel.findFirst({
    where: {
      id: modelId,
      deletedAt: null,
      ...(providerId ? { providerId } : {}),
      provider: { deletedAt: null, OR: [{ organizationId }, { organizationId: null }] },
    },
  });
  if (!model)
    throw new AiServiceError(
      "AI model is not available to this tenant.",
      "AI_MODEL_NOT_FOUND",
      404,
    );
  return model;
}

export async function createAiProvider(
  organizationId: string | null,
  actorUserId: string | undefined,
  input: AiProviderInput,
) {
  const parsed = aiProviderSchema.parse(input);
  const provider = await prisma.aiProvider.create({
    data: {
      ...parsed,
      organizationId,
      baseUrl: parsed.baseUrl || null,
      metadata: parsed.metadata as Prisma.InputJsonValue,
    },
  });
  await createAiAuditLog({
    organizationId: organizationId ?? undefined,
    actorUserId,
    action: "ai.provider.created",
    metadata: { providerId: provider.id, key: provider.key },
  });
  return provider;
}

export async function createAiModel(
  organizationId: string | null,
  actorUserId: string | undefined,
  input: AiModelInput,
) {
  const parsed = aiModelSchema.parse(input);
  const provider = organizationId
    ? await assertTenantProvider(organizationId, parsed.providerId)
    : await prisma.aiProvider.findUnique({ where: { id: parsed.providerId } });
  if (!provider)
    throw new AiServiceError("AI provider was not found.", "AI_PROVIDER_NOT_FOUND", 404);
  const model = await prisma.aiModel.create({
    data: {
      providerId: parsed.providerId,
      key: parsed.key,
      name: parsed.name,
      status: parsed.status,
      contextWindow: parsed.contextWindow === "" ? null : parsed.contextWindow,
      supportsStreaming: parsed.supportsStreaming,
      inputModalities: parsed.inputModalities,
      outputModalities: parsed.outputModalities,
      metadata: parsed.metadata as Prisma.InputJsonValue,
    },
  });
  await createAiAuditLog({
    organizationId: organizationId ?? provider.organizationId ?? undefined,
    actorUserId,
    action: "ai.model.created",
    metadata: { modelId: model.id, providerId: provider.id },
  });
  return model;
}

export async function createPromptTemplate(
  organizationId: string | null,
  actorUserId: string | undefined,
  input: AiPromptTemplateInput,
) {
  const parsed = aiPromptTemplateSchema.parse(input);
  const template = await prisma.aiPromptTemplate.create({
    data: {
      ...parsed,
      organizationId,
      description: parsed.description || null,
      variables: parsed.variables,
      metadata: parsed.metadata as Prisma.InputJsonValue,
    },
  });
  await createAiAuditLog({
    organizationId: organizationId ?? undefined,
    actorUserId,
    action: "ai.prompt_template.created",
    metadata: { promptTemplateId: template.id, key: template.key },
  });
  return template;
}

export async function createAiRequest(
  organizationId: string,
  actorUserId: string | undefined,
  input: AiRequestInput,
) {
  const parsed = aiRequestSchema.parse(input);
  const configuration = await prisma.aiConfiguration.findUnique({ where: { organizationId } });
  if (!configuration?.isEnabled)
    throw new AiServiceError("AI is disabled for this organization.", "AI_DISABLED", 403);
  await enforceRateLimit(organizationId, configuration.rateLimitPerMinute);
  const adapter = await resolveProviderAdapter({
    organizationId,
    providerId: parsed.providerId || undefined,
    modelId: parsed.modelId || undefined,
  });
  if (parsed.streamRequested && !configuration.streamingEnabled)
    throw new AiServiceError(
      "AI streaming is disabled for this organization.",
      "AI_STREAMING_DISABLED",
      403,
    );
  const timeoutMs =
    parsed.timeoutMs ?? configuration.timeoutMs ?? adapter.provider.defaultTimeoutMs;
  const retryCount =
    parsed.retryCount ?? configuration.retryCount ?? adapter.provider.defaultRetryCount;
  const request = await prisma.aiRequest.create({
    data: {
      organizationId,
      actorUserId,
      providerId: adapter.provider.id,
      modelId: adapter.model?.id,
      promptTemplateId: parsed.promptTemplateId || null,
      featureKey: parsed.featureKey,
      requestHash: hashPayload(parsed.input),
      timeoutMs,
      retryCount,
      streamRequested: parsed.streamRequested,
      metadata: { inputShape: Object.keys(parsed.input), ...parsed.metadata },
    },
  });
  await createAiAuditLog({
    organizationId,
    actorUserId,
    requestId: request.id,
    action: "ai.request.created",
    metadata: {
      featureKey: parsed.featureKey,
      providerId: adapter.provider.id,
      modelId: adapter.model?.id,
    },
  });
  return request;
}

export async function recordAiResponse(input: {
  requestId: string;
  response: Record<string, unknown>;
  finishReason?: string;
  latencyMs?: number;
  inputTokens?: number;
  outputTokens?: number;
}) {
  const response = await prisma.aiResponse.create({
    data: {
      requestId: input.requestId,
      responseHash: hashPayload(input.response),
      finishReason: input.finishReason,
      latencyMs: input.latencyMs,
    },
  });
  const request = await prisma.aiRequest.update({
    where: { id: input.requestId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      inputTokens: input.inputTokens ?? 0,
      outputTokens: input.outputTokens ?? 0,
      totalTokens: (input.inputTokens ?? 0) + (input.outputTokens ?? 0),
    },
  });
  await incrementUsage(
    request.organizationId,
    request.providerId,
    request.modelId,
    request.featureKey,
    true,
    input.inputTokens ?? 0,
    input.outputTokens ?? 0,
  );
  await createAiAuditLog({
    organizationId: request.organizationId,
    actorUserId: request.actorUserId ?? undefined,
    requestId: request.id,
    action: "ai.response.recorded",
  });
  return response;
}

export async function recordAiError(requestId: string, code: string, message: string) {
  const request = await prisma.aiRequest.update({
    where: { id: requestId },
    data: { status: "FAILED", errorCode: code, errorMessage: message, completedAt: new Date() },
  });
  await incrementUsage(
    request.organizationId,
    request.providerId,
    request.modelId,
    request.featureKey,
    false,
    0,
    0,
  );
  await createAiAuditLog({
    organizationId: request.organizationId,
    actorUserId: request.actorUserId ?? undefined,
    requestId,
    action: "ai.request.failed",
    severity: "WARNING",
    metadata: { code, message },
  });
  return request;
}

async function incrementUsage(
  organizationId: string,
  providerId: string | null,
  modelId: string | null,
  featureKey: string,
  success: boolean,
  inputTokens: number,
  outputTokens: number,
) {
  const { start, end } = dayBounds();
  const existing = await prisma.aiUsageStatistic.findFirst({
    where: { organizationId, providerId, modelId, featureKey, periodStart: start },
  });
  if (existing) {
    await prisma.aiUsageStatistic.update({
      where: { id: existing.id },
      data: {
        requestCount: { increment: 1 },
        successCount: { increment: success ? 1 : 0 },
        failureCount: { increment: success ? 0 : 1 },
        inputTokens: { increment: inputTokens },
        outputTokens: { increment: outputTokens },
        totalTokens: { increment: inputTokens + outputTokens },
      },
    });
    return;
  }
  await prisma.aiUsageStatistic.create({
    data: {
      organizationId,
      providerId,
      modelId,
      featureKey,
      periodStart: start,
      periodEnd: end,
      requestCount: 1,
      successCount: success ? 1 : 0,
      failureCount: success ? 0 : 1,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
    },
  });
}

export async function checkProviderHealth(
  providerId: string,
  organizationId?: string,
  actorUserId?: string,
) {
  const provider = await prisma.aiProvider.findFirst({
    where: {
      id: providerId,
      deletedAt: null,
      ...(organizationId ? { OR: [{ organizationId }, { organizationId: null }] } : {}),
    },
  });
  if (!provider)
    throw new AiServiceError("AI provider was not found.", "AI_PROVIDER_NOT_FOUND", 404);
  const adapter = createProviderAdapter(provider);
  const result = await adapter.checkHealth(provider.defaultTimeoutMs);
  const health = await prisma.aiProviderHealth.create({
    data: {
      providerId,
      organizationId: provider.organizationId,
      status: result.status,
      latencyMs: result.latencyMs,
      message: result.message,
    },
  });
  await createAiAuditLog({
    organizationId: provider.organizationId ?? organizationId,
    actorUserId,
    action: "ai.provider.health_checked",
    metadata: { providerId, status: result.status },
  });
  return health;
}

export async function listAiRequests(organizationId: string | null, queryInput: AiListQuery) {
  const query = aiListQuerySchema.parse(queryInput);
  const where = {
    ...(organizationId ? { organizationId } : {}),
    ...(query.q ? { featureKey: { contains: query.q, mode: "insensitive" as const } } : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.aiRequest.findMany({
      where,
      include: { provider: true, model: true, actorUser: true },
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.aiRequest.count({ where }),
  ]);
  return { items, total, page: query.page, pageSize: query.pageSize };
}

export async function getPlatformAiDashboard() {
  const [providers, requests, errors, usage, health] = await prisma.$transaction([
    prisma.aiProvider.findMany({
      where: { deletedAt: null },
      include: { models: true, healthChecks: { orderBy: { checkedAt: "desc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.aiRequest.findMany({
      include: { organization: true, provider: true, model: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.aiRequest.findMany({
      where: { status: { in: ["FAILED", "TIMED_OUT"] } },
      include: { organization: true, provider: true, model: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.aiUsageStatistic.findMany({
      include: { organization: true, provider: true, model: true },
      orderBy: { periodStart: "desc" },
      take: 20,
    }),
    prisma.aiProviderHealth.findMany({
      include: { provider: true, organization: true },
      orderBy: { checkedAt: "desc" },
      take: 20,
    }),
  ]);
  return { providers, requests, errors, usage, health };
}

import type { AiModel, AiProvider } from "@prisma/client";
import { prisma } from "@/database/client";
import { AiServiceError } from "@/services/ai/errors";

export type AiProviderCapability = "text" | "vision" | "embedding" | "streaming";

export type AiProviderRequest = {
  requestId: string;
  featureKey: string;
  input: Record<string, unknown>;
  timeoutMs: number;
  streamRequested: boolean;
};

export type AiProviderResult = {
  response: Record<string, unknown>;
  inputTokens: number;
  outputTokens: number;
  finishReason?: string;
};

export interface AiProviderAdapter {
  provider: AiProvider;
  model?: AiModel | null;
  capabilities: Set<AiProviderCapability>;
  execute(request: AiProviderRequest): Promise<AiProviderResult>;
  stream(request: AiProviderRequest): AsyncIterable<AiProviderResult>;
  checkHealth(timeoutMs: number): Promise<{
    status: "HEALTHY" | "DEGRADED" | "UNAVAILABLE" | "UNKNOWN";
    latencyMs?: number;
    message?: string;
  }>;
}

class RegisteredHttpProviderAdapter implements AiProviderAdapter {
  capabilities: Set<AiProviderCapability>;

  constructor(
    public provider: AiProvider,
    public model?: AiModel | null,
  ) {
    this.capabilities = new Set(["text"]);
    if (provider.supportsStreaming || model?.supportsStreaming) this.capabilities.add("streaming");
  }

  async execute(_request: AiProviderRequest): Promise<AiProviderResult> {
    throw new AiServiceError(
      "Provider runtime execution requires a configured secret-backed connector in a later AI capability phase.",
      "AI_PROVIDER_CONNECTOR_NOT_CONFIGURED",
      409,
    );
  }

  async *stream(request: AiProviderRequest): AsyncIterable<AiProviderResult> {
    if (!this.capabilities.has("streaming")) {
      throw new AiServiceError(
        "The selected AI provider does not support streaming.",
        "AI_STREAMING_NOT_SUPPORTED",
        400,
      );
    }
    yield await this.execute(request);
  }

  async checkHealth(timeoutMs: number) {
    const started = Date.now();
    if (this.provider.status === "DISABLED" || this.provider.status === "INACTIVE") {
      return {
        status: "UNAVAILABLE" as const,
        latencyMs: Date.now() - started,
        message: "Provider is not active.",
      };
    }
    if (!this.provider.baseUrl) {
      return {
        status: "UNKNOWN" as const,
        latencyMs: Date.now() - started,
        message: "Provider endpoint is not configured.",
      };
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(this.provider.baseUrl, {
        method: "HEAD",
        signal: controller.signal,
      });
      return {
        status: response.ok ? ("HEALTHY" as const) : ("DEGRADED" as const),
        latencyMs: Date.now() - started,
        message: `HTTP ${response.status}`,
      };
    } catch (error) {
      return {
        status: "UNAVAILABLE" as const,
        latencyMs: Date.now() - started,
        message: error instanceof Error ? error.message : "Health check failed.",
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}

export async function listRegisteredProviders(organizationId?: string) {
  return prisma.aiProvider.findMany({
    where: {
      deletedAt: null,
      OR: [{ organizationId: organizationId ?? null }, { organizationId: null }],
    },
    include: {
      models: { where: { deletedAt: null }, orderBy: { name: "asc" } },
      healthChecks: { orderBy: { checkedAt: "desc" }, take: 1 },
    },
    orderBy: [{ organizationId: "desc" }, { name: "asc" }],
  });
}

export function createProviderAdapter(
  provider: AiProvider,
  model?: AiModel | null,
): AiProviderAdapter {
  return new RegisteredHttpProviderAdapter(provider, model);
}

export async function resolveProviderAdapter(input: {
  organizationId: string;
  providerId?: string;
  modelId?: string;
}) {
  const configuration = await prisma.aiConfiguration.findUnique({
    where: { organizationId: input.organizationId },
  });
  const providerId = input.providerId || configuration?.defaultProviderId;
  if (!providerId)
    throw new AiServiceError(
      "No AI provider has been selected for this request.",
      "AI_PROVIDER_REQUIRED",
      400,
    );
  const provider = await prisma.aiProvider.findFirst({
    where: {
      id: providerId,
      deletedAt: null,
      OR: [{ organizationId: input.organizationId }, { organizationId: null }],
    },
  });
  if (!provider)
    throw new AiServiceError(
      "AI provider was not found for this tenant.",
      "AI_PROVIDER_NOT_FOUND",
      404,
    );
  const modelId = input.modelId || configuration?.defaultModelId;
  const model = modelId
    ? await prisma.aiModel.findFirst({
        where: { id: modelId, providerId: provider.id, deletedAt: null },
      })
    : null;
  if (modelId && !model)
    throw new AiServiceError(
      "AI model was not found for the selected provider.",
      "AI_MODEL_NOT_FOUND",
      404,
    );
  return createProviderAdapter(provider, model);
}

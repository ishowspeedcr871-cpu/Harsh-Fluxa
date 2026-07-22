import { z } from "zod";

const jsonRecord = z.record(z.unknown());

export const aiProviderStatusValues = ["ACTIVE", "INACTIVE", "DEGRADED", "DISABLED"] as const;
export const aiModelStatusValues = ["ACTIVE", "INACTIVE", "DEPRECATED"] as const;
export const aiPromptTemplateStatusValues = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;
export const aiFeatureFlagKeys = [
  "ocr_foundation",
  "ai_chat_foundation",
  "print_assistant_foundation",
  "automation_foundation",
] as const;

export const aiProviderSchema = z.object({
  key: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9][a-z0-9-_]*$/),
  name: z.string().trim().min(2).max(120),
  status: z.enum(aiProviderStatusValues).default("INACTIVE"),
  baseUrl: z.string().trim().url().optional().or(z.literal("")),
  defaultTimeoutMs: z.coerce.number().int().min(1000).max(120000).default(30000),
  defaultRetryCount: z.coerce.number().int().min(0).max(5).default(2),
  supportsStreaming: z.coerce.boolean().default(false),
  metadata: jsonRecord.optional(),
});

export const aiModelSchema = z.object({
  providerId: z.string().trim().min(1),
  key: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9._:-]*$/),
  name: z.string().trim().min(2).max(160),
  status: z.enum(aiModelStatusValues).default("ACTIVE"),
  contextWindow: z.coerce.number().int().positive().max(10_000_000).optional().or(z.literal("")),
  supportsStreaming: z.coerce.boolean().default(false),
  inputModalities: z.array(z.string().trim().min(1).max(40)).max(12).default(["text"]),
  outputModalities: z.array(z.string().trim().min(1).max(40)).max(12).default(["text"]),
  metadata: jsonRecord.optional(),
});

export const aiConfigurationSchema = z.object({
  defaultProviderId: z.string().trim().optional().or(z.literal("")),
  defaultModelId: z.string().trim().optional().or(z.literal("")),
  isEnabled: z.coerce.boolean().default(false),
  streamingEnabled: z.coerce.boolean().default(false),
  timeoutMs: z.coerce.number().int().min(1000).max(120000).default(30000),
  retryCount: z.coerce.number().int().min(0).max(5).default(2),
  rateLimitPerMinute: z.coerce.number().int().min(1).max(600).default(60),
  featureFlags: z.record(z.boolean()).default({}),
});

export const aiPromptTemplateSchema = z.object({
  key: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9][a-z0-9-_]*$/),
  name: z.string().trim().min(2).max(140),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  status: z.enum(aiPromptTemplateStatusValues).default("DRAFT"),
  version: z.coerce.number().int().positive().max(1000).default(1),
  template: z.string().trim().min(10).max(20000),
  variables: z.array(z.string().trim().min(1).max(80)).max(100).default([]),
  metadata: jsonRecord.optional(),
});

export const aiRequestSchema = z.object({
  featureKey: z.string().trim().min(2).max(120),
  providerId: z.string().trim().optional().or(z.literal("")),
  modelId: z.string().trim().optional().or(z.literal("")),
  promptTemplateId: z.string().trim().optional().or(z.literal("")),
  input: jsonRecord,
  streamRequested: z.coerce.boolean().default(false),
  timeoutMs: z.coerce.number().int().min(1000).max(120000).optional(),
  retryCount: z.coerce.number().int().min(0).max(5).optional(),
  metadata: jsonRecord.optional(),
});

export const aiListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(5).max(100).default(20),
  q: z.string().trim().max(120).optional(),
});

export type AiProviderInput = z.infer<typeof aiProviderSchema>;
export type AiModelInput = z.infer<typeof aiModelSchema>;
export type AiConfigurationInput = z.infer<typeof aiConfigurationSchema>;
export type AiPromptTemplateInput = z.infer<typeof aiPromptTemplateSchema>;
export type AiRequestInput = z.infer<typeof aiRequestSchema>;
export type AiListQuery = z.infer<typeof aiListQuerySchema>;

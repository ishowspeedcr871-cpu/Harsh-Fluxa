import { z } from "zod";

export const recommendationStatusValues = ["ACTIVE", "ACCEPTED", "REJECTED", "SUPERSEDED"] as const;
export const automationRuleStatusValues = ["ACTIVE", "PAUSED", "ARCHIVED"] as const;
export const automationTriggerValues = [
  "PRINT_JOB_CREATED",
  "PRINT_JOB_UPDATED",
  "OCR_COMPLETED",
  "DOCUMENT_ANALYZED",
  "SCHEDULED",
  "MANUAL",
] as const;
export const searchScopes = [
  "ALL",
  "CUSTOMERS",
  "ORGANIZATIONS",
  "EMPLOYEES",
  "JOBS",
  "FILES",
  "OCR",
  "AI_ANALYSIS",
] as const;

const jsonRecord = z.record(z.unknown());

export const createRecommendationSchema = z.object({
  printJobId: z.string().trim().optional().or(z.literal("")),
  printJobFileId: z.string().trim().optional().or(z.literal("")),
  documentAnalysisId: z.string().trim().optional().or(z.literal("")),
});

export const recommendationFeedbackSchema = z.object({
  recommendationId: z.string().trim().min(1),
  accepted: z.coerce.boolean(),
  reason: z.string().trim().max(500).optional().or(z.literal("")),
});

export const automationConditionSchema = z.object({
  field: z.enum([
    "status",
    "priority",
    "estimatedCost",
    "fileCount",
    "fileHealth",
    "imageQuality",
    "color",
  ]),
  operator: z.enum(["equals", "not_equals", "gte", "lte", "contains"]),
  value: z.union([z.string(), z.number(), z.boolean()]),
});

export const automationActionSchema = z.object({
  type: z.enum(["set_priority", "assign_printer", "notify", "mark_for_approval", "reject_job"]),
  value: z.union([z.string(), z.number(), z.boolean(), jsonRecord]).optional(),
});

export const automationRuleSchema = z.object({
  name: z.string().trim().min(2).max(140),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  status: z.enum(automationRuleStatusValues).default("ACTIVE"),
  triggerType: z.enum(automationTriggerValues),
  conditions: z.array(automationConditionSchema).max(20).default([]),
  actions: z.array(automationActionSchema).min(1).max(20),
  priority: z.coerce.number().int().min(1).max(1000).default(100),
  rateLimitPerHour: z.coerce.number().int().min(1).max(1000).default(120),
});

export const automationExecuteSchema = z.object({
  triggerType: z.enum(automationTriggerValues),
  printJobId: z.string().trim().optional().or(z.literal("")),
});

export const intelligentSearchSchema = z.object({
  q: z.string().trim().min(1).max(160),
  scope: z.enum(searchScopes).default("ALL"),
  sort: z.enum(["relevance", "newest", "oldest"]).default("relevance"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(5).max(50).default(10),
});

export const savedSearchSchema = intelligentSearchSchema.extend({
  name: z.string().trim().min(2).max(120),
});

export type CreateRecommendationInput = z.infer<typeof createRecommendationSchema>;
export type RecommendationFeedbackInput = z.infer<typeof recommendationFeedbackSchema>;
export type AutomationRuleInput = z.infer<typeof automationRuleSchema>;
export type AutomationExecuteInput = z.infer<typeof automationExecuteSchema>;
export type IntelligentSearchInput = z.infer<typeof intelligentSearchSchema>;
export type SavedSearchInput = z.infer<typeof savedSearchSchema>;

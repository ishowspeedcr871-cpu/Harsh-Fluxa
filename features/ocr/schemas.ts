import { z } from "zod";

export const ocrJobStatusValues = [
  "QUEUED",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
  "RETRYING",
] as const;
export const documentFileHealthValues = ["HEALTHY", "WARNING", "CRITICAL", "UNKNOWN"] as const;
export const documentImageQualityValues = ["HIGH", "MEDIUM", "LOW", "UNKNOWN"] as const;

export const ocrRequestedFeaturesSchema = z.object({
  extractText: z.coerce.boolean().default(true),
  analyzeLayout: z.coerce.boolean().default(true),
  detectBlankPages: z.coerce.boolean().default(true),
  detectDuplicatePages: z.coerce.boolean().default(true),
  estimatePrintMetrics: z.coerce.boolean().default(true),
});

export const createOcrJobSchema = z.object({
  printJobFileId: z.string().trim().min(1),
  languageHint: z.string().trim().min(2).max(16).optional().or(z.literal("")),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  timeoutMs: z.coerce.number().int().min(5000).max(180000).default(60000),
  maxAttempts: z.coerce.number().int().min(1).max(5).default(3),
  requestedFeatures: ocrRequestedFeaturesSchema.default({}),
});

export const processOcrJobSchema = z.object({
  ocrJobId: z.string().trim().min(1),
});

export const ocrListQuerySchema = z.object({
  status: z.enum([...ocrJobStatusValues, "all"]).default("all"),
  q: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(5).max(100).default(20),
});

export const previewQuerySchema = z.object({
  ocrJobId: z.string().trim().optional(),
  printJobFileId: z.string().trim().optional(),
});

export type CreateOcrJobInput = z.infer<typeof createOcrJobSchema>;
export type ProcessOcrJobInput = z.infer<typeof processOcrJobSchema>;
export type OcrListQuery = z.infer<typeof ocrListQuerySchema>;
export type PreviewQuery = z.infer<typeof previewQuerySchema>;

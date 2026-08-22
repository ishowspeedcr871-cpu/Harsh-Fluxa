import { z } from "zod";
import { customerUploadConfigurationSchema } from "@/features/customer/upload-schemas";

export const printJobStatusValues = [
  "DRAFT",
  "UPLOADED",
  "VALIDATING",
  "QUEUED",
  "ASSIGNED",
  "PRINTING",
  "READY",
  "OTP_GENERATED",
  "COLLECTED",
  "COMPLETED",
  "CANCELLED",
  "FAILED",
] as const;

export const printJobQuerySchema = z.object({
  q: z.string().trim().optional(),
  status: z.enum([...printJobStatusValues, "all"]).default("all"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(5).max(50).default(10),
});

export const createPrintJobSchema = customerUploadConfigurationSchema.extend({
  title: z.string().trim().min(2).max(140),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  estimatedCost: z.coerce.number().nonnegative().optional(),
  fileHistory: z.string().trim().max(1000).optional().or(z.literal("")),
  files: z.array(z.object({
    fileName: z.string().min(1),
    fileSize: z.number().int().positive(),
    mimeType: z.string().min(1),
    storageKey: z.string().regex(/^gridfs:[^:]+:[^:]+:[a-fA-F0-9]{24}$/),
    checksumSha256: z.string().regex(/^[a-fA-F0-9]{64}$/)
  })).min(1)
});

export const uploadFileSchema = z.object({
  printJobId: z.string().min(1),
  fileName: z.string().trim().min(1).max(240),
  fileSize: z.coerce
    .number()
    .int()
    .positive()
    .max(100 * 1024 * 1024),
  mimeType: z.string().trim().min(3).max(120),
  storageKey: z.string().trim().regex(/^gridfs:[^:]+:[^:]+:[a-fA-F0-9]{24}$/),
  checksumSha256: z.string().trim().regex(/^[a-fA-F0-9]{64}$/),
});

export type PrintJobQuery = z.infer<typeof printJobQuerySchema>;
export type CreatePrintJobInput = z.infer<typeof createPrintJobSchema>;
export type UploadFileInput = z.infer<typeof uploadFileSchema>;

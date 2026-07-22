import { z } from "zod";
import { printJobStatusValues } from "@/features/print-jobs/schemas";

export const queueQuerySchema = z.object({
  q: z.string().trim().optional(),
  status: z.enum([...printJobStatusValues, "all"]).default("all"),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT", "all"]).default("all"),
  assigned: z.enum(["mine", "unassigned", "all"]).default("all"),
  sort: z.enum(["createdAt", "priority", "status", "title"]).default("createdAt"),
  direction: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(5).max(50).default(10),
});

export const jobOperationSchema = z.object({
  jobId: z.string().min(1),
  note: z.string().trim().max(240).optional().or(z.literal("")),
});

export const assignPrinterSchema = z.object({
  jobId: z.string().min(1),
  printerId: z.string().min(1),
});

export const createPrinterSchema = z.object({
  name: z.string().trim().min(2).max(120),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  model: z.string().trim().max(120).optional().or(z.literal("")),
  isColor: z.coerce.boolean().default(true),
  supportsDuplex: z.coerce.boolean().default(true),
});

export type QueueQuery = z.infer<typeof queueQuerySchema>;

import { z } from "zod";
import { printJobStatusValues } from "@/features/print-jobs/schemas";

export const exportFormats = ["csv", "excel", "pdf"] as const;
export type ExportFormat = (typeof exportFormats)[number];

export const reportQuerySchema = z.object({
  q: z.string().trim().optional().default(""),
  status: z
    .enum(["all", ...printJobStatusValues])
    .optional()
    .default("all"),
  organizationId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sort: z
    .enum(["createdAt", "title", "status", "priority", "estimatedCost"])
    .optional()
    .default("createdAt"),
  direction: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().min(5).max(100).optional().default(25),
  exportFormat: z.enum(exportFormats).optional(),
});

export type ReportQuery = z.infer<typeof reportQuerySchema>;

import { z } from "zod";

export const platformQuerySchema = z.object({
  q: z.string().trim().optional().default(""),
  status: z.string().trim().optional().default("all"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(5).max(100).default(20),
});

export const organizationStatusActionSchema = z.object({
  organizationId: z.string().min(1),
  status: z.enum(["ACTIVE", "SUSPENDED", "ARCHIVED"]),
});

export const organizationImpersonationSchema = z.object({
  organizationId: z.string().min(1),
});

export const platformSettingSchema = z.object({
  key: z.string().trim().min(2).max(120),
  value: z.string().trim().min(1),
});

export const platformAnnouncementSchema = z.object({
  title: z.string().trim().min(3).max(140),
  message: z.string().trim().min(3).max(500),
  audience: z.enum(["PLATFORM", "ORGANIZATION", "USER"]).default("PLATFORM"),
});

export const apiKeyFoundationSchema = z.object({
  name: z.string().trim().min(3).max(120),
  scope: z.string().trim().min(3).max(120).default("platform.read"),
});

export type PlatformQuery = z.infer<typeof platformQuerySchema>;

import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .min(3, "Slug must be at least 3 characters.")
  .max(64, "Slug must be 64 characters or fewer.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens.");

export const organizationCreateSchema = z.object({
  name: z.string().trim().min(2, "Organization name is required.").max(120),
  slug: slugSchema,
  timezone: z.string().trim().min(2).max(80).default("UTC"),
  currency: z
    .string()
    .trim()
    .length(3)
    .transform((value) => value.toUpperCase())
    .default("USD"),
});

export const organizationUpdateSchema = organizationCreateSchema.partial().extend({
  organizationId: z.string().min(1),
});

export const organizationSettingsSchema = z.object({
  organizationId: z.string().min(1),
  displayName: z.string().trim().max(120).optional().or(z.literal("")),
  supportEmail: z.string().trim().email().optional().or(z.literal("")),
  supportPhone: z.string().trim().max(40).optional().or(z.literal("")),
});

export const organizationSwitchSchema = z.object({
  organizationId: z.string().min(1),
});

export type OrganizationCreateInput = z.infer<typeof organizationCreateSchema>;
export type OrganizationUpdateInput = z.infer<typeof organizationUpdateSchema>;
export type OrganizationSettingsInput = z.infer<typeof organizationSettingsSchema>;
export type OrganizationSwitchInput = z.infer<typeof organizationSwitchSchema>;

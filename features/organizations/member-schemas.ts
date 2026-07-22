import { z } from "zod";

export const organizationMemberQuerySchema = z.object({
  q: z.string().trim().optional(),
  status: z.enum(["ACTIVE", "INVITED", "SUSPENDED", "REMOVED", "all"]).default("ACTIVE"),
  sort: z.enum(["name", "email", "role", "createdAt"]).default("createdAt"),
  direction: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(5).max(50).default(10),
});

export const inviteMemberSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((email) => email.toLowerCase()),
  roleId: z.string().min(1),
  expiresInDays: z.coerce.number().int().min(1).max(30).default(7),
});

export const updateMembershipSchema = z.object({
  membershipId: z.string().min(1),
  roleId: z.string().min(1),
  status: z.enum(["ACTIVE", "SUSPENDED", "REMOVED"]),
});

export const createRoleSchema = z.object({
  name: z.string().trim().min(2).max(80),
  key: z
    .string()
    .trim()
    .min(3)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(240).optional().or(z.literal("")),
  permissions: z.array(z.string()).default([]),
});

export const updateRoleSchema = createRoleSchema.extend({ roleId: z.string().min(1) });

export type OrganizationMemberQuery = z.infer<typeof organizationMemberQuerySchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMembershipInput = z.infer<typeof updateMembershipSchema>;
export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;

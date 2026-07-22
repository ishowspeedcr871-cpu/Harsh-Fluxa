import { z } from "zod";

export const notificationQuerySchema = z.object({
  status: z.enum(["all", "UNREAD", "READ", "ARCHIVED"]).optional().default("all"),
  type: z.string().optional().default("all"),
  q: z.string().trim().optional().default(""),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().min(5).max(50).optional().default(25),
});

export type NotificationQuery = z.infer<typeof notificationQuerySchema>;

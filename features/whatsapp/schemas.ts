import { z } from "zod";

export const whatsappProviderSchema = z.object({
  providerKey: z.string().trim().min(2).max(80),
  displayName: z.string().trim().min(2).max(120),
  webhookSecret: z.string().trim().min(16).max(240).optional(),
  isEnabled: z.coerce.boolean().default(false),
});

export const whatsappMediaSchema = z.object({
  id: z.string().trim().min(1),
  mimeType: z.string().trim().min(3).max(120),
  fileName: z.string().trim().min(1).max(240).optional(),
  sizeBytes: z.coerce.number().int().positive().optional(),
  providerUrl: z.string().url().optional(),
});

export const incomingWhatsappMessageSchema = z.object({
  providerKey: z.string().trim().min(2).max(80),
  organizationId: z.string().trim().min(1),
  externalMessageId: z.string().trim().min(1),
  fromPhone: z.string().trim().min(6).max(40),
  displayName: z.string().trim().max(120).optional(),
  text: z.string().trim().max(2000).optional(),
  media: z.array(whatsappMediaSchema).default([]),
  receivedAt: z.coerce.date().default(() => new Date()),
});

export type WhatsappProviderSettings = z.infer<typeof whatsappProviderSchema>;
export type IncomingWhatsappMessage = z.infer<typeof incomingWhatsappMessageSchema>;

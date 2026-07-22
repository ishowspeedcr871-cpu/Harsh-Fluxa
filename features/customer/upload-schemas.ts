import { z } from "zod";

export const paperSizes = ["A4", "A3", "Letter", "Legal"] as const;
export const orientations = ["portrait", "landscape"] as const;
export const paperQualities = ["standard", "premium", "photo", "recycled"] as const;

export const customerUploadConfigurationSchema = z.object({
  paperSize: z.enum(paperSizes).default("A4"),
  color: z.coerce.boolean().default(false),
  copies: z.coerce.number().int().min(1).max(100).default(1),
  duplex: z.coerce.boolean().default(true),
  orientation: z.enum(orientations).default("portrait"),
  pageRange: z.string().trim().max(80).optional().or(z.literal("")),
  paperQuality: z.enum(paperQualities).default("standard"),
  specialInstructions: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type CustomerUploadConfiguration = z.infer<typeof customerUploadConfigurationSchema>;

export function estimateUploadCost(input: { copies: number; color: boolean }) {
  const rate = input.color ? 10 : 2;
  return input.copies * rate;
}

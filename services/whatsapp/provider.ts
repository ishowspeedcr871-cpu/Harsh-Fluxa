import type {
  IncomingWhatsappMessage,
  WhatsappProviderSettings,
} from "@/features/whatsapp/schemas";

export type WhatsappWebhookRequest = {
  headers: Headers;
  body: unknown;
};

export type WhatsappProviderAdapter = {
  key: string;
  normalizeWebhook(
    request: WhatsappWebhookRequest,
    settings: WhatsappProviderSettings,
  ): Promise<IncomingWhatsappMessage[]>;
  buildConfirmationMessage(input: {
    toPhone: string;
    jobTitle: string;
    jobId: string;
  }): Promise<unknown>;
};

export type WhatsappPipelineResult = {
  status: "processed" | "ignored" | "failed";
  printJobIds: string[];
  errors: string[];
};

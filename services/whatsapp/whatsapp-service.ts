import type { Prisma } from "@prisma/client";
import { prisma } from "@/database/client";
import {
  incomingWhatsappMessageSchema,
  whatsappProviderSchema,
  type IncomingWhatsappMessage,
  type WhatsappProviderSettings,
} from "@/features/whatsapp/schemas";
import { createAuditLog } from "@/services/audit/log";
import type { WhatsappPipelineResult } from "@/services/whatsapp/provider";

const WHATSAPP_SETTINGS_KEY = "whatsappBusiness";

function objectMetadata(
  value: Prisma.JsonValue | null | undefined,
): Record<string, Prisma.JsonValue> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, Prisma.JsonValue>)
    : {};
}

export async function getWhatsappSettings(organizationId: string) {
  const settings = await prisma.organizationSettings.findUnique({ where: { organizationId } });
  const metadata = objectMetadata(settings?.metadata);
  const raw = metadata[WHATSAPP_SETTINGS_KEY];
  const parsed = whatsappProviderSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export async function upsertWhatsappSettings(
  organizationId: string,
  input: WhatsappProviderSettings,
  actorUserId?: string,
) {
  const parsed = whatsappProviderSchema.parse(input);
  const existing = await prisma.organizationSettings.findUnique({ where: { organizationId } });
  const metadata = objectMetadata(existing?.metadata);
  const updatedMetadata = { ...metadata, [WHATSAPP_SETTINGS_KEY]: parsed };
  await prisma.organizationSettings.upsert({
    where: { organizationId },
    update: { metadata: updatedMetadata },
    create: { organizationId, metadata: updatedMetadata },
  });
  await createAuditLog({
    organizationId,
    actorUserId,
    action: "whatsapp.settings.updated",
    entityType: "OrganizationSettings",
    metadata: { providerKey: parsed.providerKey, isEnabled: parsed.isEnabled },
  });
  return parsed;
}

async function identifyCustomer(organizationId: string, message: IncomingWhatsappMessage) {
  const normalizedPhone = message.fromPhone.replace(/\D/g, "");
  return prisma.user.findFirst({
    where: {
      memberships: { some: { organizationId, status: "ACTIVE" } },
      OR: [
        { email: { contains: normalizedPhone, mode: "insensitive" } },
        { name: { contains: message.displayName ?? "", mode: "insensitive" } },
      ],
    },
  });
}

export async function processIncomingWhatsappMessage(input: IncomingWhatsappMessage) {
  const message = incomingWhatsappMessageSchema.parse(input);
  const settings = await getWhatsappSettings(message.organizationId);
  const result: WhatsappPipelineResult = { status: "ignored", printJobIds: [], errors: [] };

  if (!settings?.isEnabled || settings.providerKey !== message.providerKey) {
    await createAuditLog({
      organizationId: message.organizationId,
      action: "whatsapp.message.ignored",
      entityType: "WhatsappMessage",
      entityId: message.externalMessageId,
      severity: "WARNING",
      metadata: { reason: "provider_disabled_or_mismatch", providerKey: message.providerKey },
    });
    return result;
  }

  const customer = await identifyCustomer(message.organizationId, message);
  if (!customer) {
    result.status = "failed";
    result.errors.push("Customer could not be identified from incoming WhatsApp message.");
    await createAuditLog({
      organizationId: message.organizationId,
      action: "whatsapp.customer_identification_failed",
      entityType: "WhatsappMessage",
      entityId: message.externalMessageId,
      severity: "WARNING",
      metadata: { fromPhone: message.fromPhone, displayName: message.displayName },
    });
    return result;
  }

  if (!message.media.length) {
    await createAuditLog({
      organizationId: message.organizationId,
      actorUserId: customer.id,
      action: "whatsapp.message.received_without_media",
      entityType: "WhatsappMessage",
      entityId: message.externalMessageId,
      metadata: { text: message.text },
    });
    return result;
  }

  const job = await prisma.printJob.create({
    data: {
      organizationId: message.organizationId,
      customerUserId: customer.id,
      title: `WhatsApp upload ${message.receivedAt.toISOString()}`,
      description: message.text ?? "Created from WhatsApp Business media intake.",
      status: "UPLOADED",
      metadata: {
        source: "whatsapp_business",
        providerKey: message.providerKey,
        externalMessageId: message.externalMessageId,
        fromPhone: message.fromPhone,
      },
      files: {
        create: message.media.map((media) => ({
          fileName: media.fileName ?? `whatsapp-media-${media.id}`,
          fileSize: media.sizeBytes ?? 1,
          mimeType: media.mimeType,
          storageKey: media.providerUrl,
          status: "UPLOADED",
          progress: 100,
        })),
      },
      events: {
        create: {
          actorUserId: customer.id,
          toStatus: "UPLOADED",
          note: "WhatsApp media intake created this print job.",
        },
      },
      activities: {
        create: {
          organizationId: message.organizationId,
          userId: customer.id,
          action: "whatsapp.print_job_created",
          description: "WhatsApp Business media was converted into a print job.",
        },
      },
      notifications: {
        create: {
          organizationId: message.organizationId,
          userId: customer.id,
          title: "WhatsApp upload received",
          message: "Your WhatsApp media was received and converted into a print job.",
        },
      },
    },
  });

  await createAuditLog({
    organizationId: message.organizationId,
    actorUserId: customer.id,
    action: "whatsapp.print_job_created",
    entityType: "PrintJob",
    entityId: job.id,
    metadata: { externalMessageId: message.externalMessageId, mediaCount: message.media.length },
  });
  return {
    status: "processed",
    printJobIds: [job.id],
    errors: [],
  } satisfies WhatsappPipelineResult;
}

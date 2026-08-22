import { prisma } from "@/database/client";
import { z } from "zod";
import { upsertPrinterFromDiscovery } from "@/services/printers/printer-service";
import { randomBytes } from "node:crypto";

export async function verifyOrganizationApiKey(key: string) {
  const apiKey = await prisma.organizationApiKey.findUnique({
    where: { key },
    include: { organization: true }
  });
  
  if (!apiKey || (apiKey.expiresAt && apiKey.expiresAt < new Date())) {
    return null;
  }
  
  await prisma.organizationApiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() }
  });
  
  return apiKey.organization;
}

export async function createOrganizationApiKey(organizationId: string, name: string) {
  const key = `fluxa_${randomBytes(32).toString("hex")}`;
  
  return prisma.organizationApiKey.create({
    data: {
      organizationId,
      name,
      key
    }
  });
}

const registerPrinterSchema = z.object({
  name: z.string(),
  macAddress: z.string(),
  ipAddress: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
});

export async function registerPrinter(organizationId: string, data: any) {
  const validated = registerPrinterSchema.parse(data);
  return upsertPrinterFromDiscovery(organizationId, validated);
}

const livePrinterSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  status: z.enum(["ONLINE", "BUSY"]).default("ONLINE"),
  health: z.enum(["GOOD", "WARNING", "CRITICAL"]).default("GOOD"),
  isDefault: z.boolean().default(false),
  driver: z.string().optional(),
  portName: z.string().optional(),
  location: z.string().optional(),
  supportsColor: z.boolean().optional(),
  supportsDuplex: z.boolean().optional(),
});

const heartbeatSchema = z.object({
  connectorId: z.string().min(1).optional(),
  macAddress: z.string().min(1),
  status: z.enum(["ONLINE", "OFFLINE", "BUSY", "ERROR", "MAINTENANCE"]),
  health: z.enum(["GOOD", "WARNING", "CRITICAL", "UNKNOWN"]).optional(),
  inkLevel: z.any().optional(),
  livePrinters: z.array(livePrinterSchema).default([]),
});

function connectorPrinterKey(connectorId: string, windowsPrinterId: string) {
  return `${connectorId}:${windowsPrinterId}`;
}

export async function syncConnectorLivePrinters(organizationId: string, connectorId: string, livePrinters: z.infer<typeof livePrinterSchema>[]) {
  const now = new Date();
  const liveIds = livePrinters.map((printer) => printer.id);

  await prisma.printer.updateMany({
    where: {
      organizationId,
      connectorId,
      windowsPrinterId: { notIn: liveIds },
      deletedAt: null,
    },
    data: {
      isAvailable: false,
      isWindowsDefault: false,
      status: "OFFLINE",
      lastDiscoveryAt: now,
    },
  });

  const synced: any[] = [];
  for (const live of livePrinters) {
    const macAddress = connectorPrinterKey(connectorId, live.id);
    const printer = await prisma.printer.upsert({
      where: { organizationId_macAddress: { organizationId, macAddress } },
      update: {
        name: live.name,
        driver: live.driver ?? null,
        location: live.location ?? live.portName ?? null,
        macAddress,
        connectorId,
        windowsPrinterId: live.id,
        status: live.status,
        health: live.health,
        isAvailable: true,
        isWindowsDefault: live.isDefault,
        isColor: live.supportsColor ?? true,
        supportsDuplex: live.supportsDuplex ?? true,
        connectionType: "SPOOLER_AGENT",
        lastSeenAt: now,
        lastDiscoveryAt: now,
      },
      create: {
        organizationId,
        name: live.name,
        driver: live.driver ?? null,
        location: live.location ?? live.portName ?? null,
        macAddress,
        connectorId,
        windowsPrinterId: live.id,
        status: live.status,
        health: live.health,
        isAvailable: true,
        isWindowsDefault: live.isDefault,
        isColor: live.supportsColor ?? true,
        supportsDuplex: live.supportsDuplex ?? true,
        connectionType: "SPOOLER_AGENT",
        lastSeenAt: now,
        lastDiscoveryAt: now,
      },
    });
    synced.push(printer);
  }

  return synced;
}

export async function printerHeartbeat(organizationId: string, data: any) {
  const validated = heartbeatSchema.parse(data);
  const connectorId = validated.connectorId ?? validated.macAddress;

  const [connectorPrinter] = await Promise.all([
    prisma.printer.findFirst({
      where: {
        organizationId,
        OR: [
          { macAddress: validated.macAddress },
          { macAddress: connectorPrinterKey(connectorId, "__connector__") },
        ],
      },
    }),
    syncConnectorLivePrinters(organizationId, connectorId, validated.livePrinters),
  ]);

  if (connectorPrinter) {
    return prisma.printer.update({
      where: { id: connectorPrinter.id },
      data: { status: validated.status, health: validated.health ?? connectorPrinter.health, connectorId, isAvailable: validated.status !== "OFFLINE", lastSeenAt: new Date(), lastDiscoveryAt: new Date() },
    });
  }

  return prisma.printer.upsert({
    where: { organizationId_macAddress: { organizationId, macAddress: validated.macAddress } },
    update: { status: validated.status, health: validated.health ?? "GOOD", connectorId, isAvailable: validated.status !== "OFFLINE", lastSeenAt: new Date(), lastDiscoveryAt: new Date() },
    create: { organizationId, name: `Connector ${connectorId}`, macAddress: validated.macAddress, connectorId, status: validated.status, health: validated.health ?? "GOOD", connectionType: "SPOOLER_AGENT", isAvailable: validated.status !== "OFFLINE", lastSeenAt: new Date(), lastDiscoveryAt: new Date() },
  });
}

export async function getPendingJobsForPrinter(organizationId: string, macAddress: string) {
  const connector = await prisma.printer.findFirst({ where: { organizationId, macAddress } });
  const connectorId = connector?.connectorId ?? macAddress;
  
  return prisma.printJob.findMany({
    where: {
      organizationId,
      status: "PRINTING",
      printer: {
        connectorId,
        isAvailable: true,
        status: { in: ["ONLINE", "BUSY"] },
        windowsPrinterId: { not: null },
      },
      files: { every: { storageKey: { not: null }, status: "UPLOADED" } }
    },
    include: { files: true, printer: true }
  });
}

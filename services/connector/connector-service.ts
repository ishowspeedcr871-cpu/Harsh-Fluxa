import { prisma } from "@/database/client";
import { z } from "zod";
import { upsertPrinterFromDiscovery, updatePrinterTelemetry } from "@/services/printers/printer-service";
import { randomBytes } from "node:crypto";

export async function verifyOrganizationApiKey(key: string) {
  const apiKey = await prisma.organizationApiKey.findUnique({
    where: { key },
    include: { organization: true }
  });
  
  if (!apiKey || (apiKey.expiresAt && apiKey.expiresAt < new Date())) {
    return null;
  }
  
  // Update last used
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

const heartbeatSchema = z.object({
  macAddress: z.string(),
  status: z.enum(["ONLINE", "OFFLINE", "BUSY", "ERROR", "MAINTENANCE"]),
  health: z.enum(["GOOD", "WARNING", "CRITICAL", "UNKNOWN"]).optional(),
  inkLevel: z.any().optional(),
});

export async function printerHeartbeat(organizationId: string, data: any) {
  const validated = heartbeatSchema.parse(data);
  
  const printer = await prisma.printer.findUnique({
    where: { 
      organizationId_macAddress: {
        organizationId,
        macAddress: validated.macAddress
      }
    }
  });
  
  if (!printer) throw new Error("Printer not registered");
  
  return updatePrinterTelemetry(printer.id, validated);
}

export async function getPendingJobsForPrinter(organizationId: string, macAddress: string) {
  const printer = await prisma.printer.findUnique({
    where: { 
      organizationId_macAddress: {
        organizationId,
        macAddress
      }
    }
  });
  
  if (!printer) return [];
  
  return prisma.printJob.findMany({
    where: {
      printerId: printer.id,
      status: "PRINTING"
    },
    include: { files: true }
  });
}

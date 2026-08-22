import { prisma } from "@/database/client";

export type ResolvedPrinter = {
  id: string;
  name: string;
  connectorId: string | null;
  windowsPrinterId: string | null;
};

export async function listAvailablePrintersForEmployee(organizationId: string, employeeUserId: string) {
  const printers = await prisma.printer.findMany({
    where: {
      organizationId,
      deletedAt: null,
      isAvailable: true,
      status: { in: ["ONLINE", "BUSY"] },
      connectorId: { not: null },
      windowsPrinterId: { not: null },
    },
    include: { assignments: { where: { assignedUserId: employeeUserId } } },
    orderBy: [{ isWindowsDefault: "desc" }, { name: "asc" }],
  });
  return printers.map((printer: any) => ({
    ...printer,
    isEmployeeDefault: printer.assignments.some((assignment: any) => assignment.isDefault),
  }));
}

export async function setEmployeeDefaultPrinter(organizationId: string, employeeUserId: string, printerId: string | null) {
  await prisma.printerAssignment.updateMany({
    where: { assignedUserId: employeeUserId, printer: { organizationId } },
    data: { isDefault: false },
  });

  if (!printerId) return null;

  const printer = await prisma.printer.findFirst({
    where: {
      id: printerId,
      organizationId,
      deletedAt: null,
      isAvailable: true,
      status: { in: ["ONLINE", "BUSY"] },
      connectorId: { not: null },
      windowsPrinterId: { not: null },
    },
  });
  if (!printer) throw new Error("NO_AVAILABLE_PRINTER: Selected default printer is not currently available from a connector.");

  return prisma.printerAssignment.upsert({
    where: { printerId_assignedUserId: { printerId, assignedUserId: employeeUserId } },
    update: { isDefault: true },
    create: { printerId, assignedUserId: employeeUserId, isDefault: true },
  });
}

export async function resolvePrinterForJob(input: {
  organizationId: string;
  employeeUserId: string;
  explicitPrinterId?: string | null;
  allowFallback?: boolean;
}): Promise<ResolvedPrinter> {
  const liveWhere = {
    organizationId: input.organizationId,
    deletedAt: null,
    isAvailable: true,
    status: { in: ["ONLINE", "BUSY"] as const },
    connectorId: { not: null },
    windowsPrinterId: { not: null },
  };

  if (input.explicitPrinterId) {
    const explicit = await prisma.printer.findFirst({ where: { ...liveWhere, id: input.explicitPrinterId } });
    if (!explicit) throw new Error("NO_AVAILABLE_PRINTER: Selected printer is not currently available from its connector.");
    return explicit;
  }

  const defaultAssignment = await prisma.printerAssignment.findFirst({
    where: { assignedUserId: input.employeeUserId, isDefault: true, printer: liveWhere },
    include: { printer: true },
  });
  if (defaultAssignment?.printer) return defaultAssignment.printer;

  if (input.allowFallback) {
    const fallback = await prisma.printer.findFirst({ where: liveWhere, orderBy: [{ isWindowsDefault: "desc" }, { name: "asc" }] });
    if (fallback) return fallback;
  }

  throw new Error("NO_AVAILABLE_PRINTER: No live connector printer is currently available.");
}

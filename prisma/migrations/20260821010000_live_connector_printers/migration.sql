ALTER TYPE "PrinterConnectionType" ADD VALUE IF NOT EXISTS 'SPOOLER_AGENT';
ALTER TABLE "Printer" ADD COLUMN "connectorId" TEXT;
ALTER TABLE "Printer" ADD COLUMN "windowsPrinterId" TEXT;
ALTER TABLE "Printer" ADD COLUMN "isAvailable" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Printer" ADD COLUMN "isWindowsDefault" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Printer" ADD COLUMN "lastDiscoveryAt" TIMESTAMP(3);
ALTER TABLE "PrinterAssignment" ADD COLUMN "isDefault" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "Printer_organizationId_connectorId_isAvailable_idx" ON "Printer"("organizationId", "connectorId", "isAvailable");
CREATE INDEX "Printer_windowsPrinterId_idx" ON "Printer"("windowsPrinterId");
CREATE INDEX "PrinterAssignment_assignedUserId_isDefault_idx" ON "PrinterAssignment"("assignedUserId", "isDefault");

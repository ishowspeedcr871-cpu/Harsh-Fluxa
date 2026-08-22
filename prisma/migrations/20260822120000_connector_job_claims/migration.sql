ALTER TABLE "PrintJob" ADD COLUMN "connectorClaimedAt" TIMESTAMP(3);
ALTER TABLE "PrintJob" ADD COLUMN "connectorClaimId" TEXT;
CREATE INDEX "PrintJob_status_connectorClaimedAt_idx" ON "PrintJob"("status", "connectorClaimedAt");

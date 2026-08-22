ALTER TABLE "PrintJobFile" ADD COLUMN "checksumSha256" TEXT;
CREATE INDEX "PrintJobFile_storageKey_idx" ON "PrintJobFile"("storageKey");

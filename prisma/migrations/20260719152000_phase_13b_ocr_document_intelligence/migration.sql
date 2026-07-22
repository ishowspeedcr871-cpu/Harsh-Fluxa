-- Phase 13B OCR Engine and Document Intelligence Platform
CREATE TYPE "OcrJobStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'RETRYING');
CREATE TYPE "OcrSourceType" AS ENUM ('PRINT_JOB_FILE', 'EXTERNAL_DOCUMENT');
CREATE TYPE "DocumentFileHealth" AS ENUM ('HEALTHY', 'WARNING', 'CRITICAL', 'UNKNOWN');
CREATE TYPE "DocumentImageQuality" AS ENUM ('HIGH', 'MEDIUM', 'LOW', 'UNKNOWN');

CREATE TABLE "OcrJob" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "requestedByUserId" TEXT,
  "printJobFileId" TEXT,
  "aiRequestId" TEXT,
  "sourceType" "OcrSourceType" NOT NULL DEFAULT 'PRINT_JOB_FILE',
  "status" "OcrJobStatus" NOT NULL DEFAULT 'QUEUED',
  "priority" "PrintJobPriority" NOT NULL DEFAULT 'NORMAL',
  "languageHint" TEXT,
  "requestedFeatures" JSONB,
  "attemptCount" INTEGER NOT NULL DEFAULT 0,
  "maxAttempts" INTEGER NOT NULL DEFAULT 3,
  "timeoutMs" INTEGER NOT NULL DEFAULT 60000,
  "errorCode" TEXT,
  "errorMessage" TEXT,
  "queuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "nextRetryAt" TIMESTAMP(3),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OcrJob_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OcrResult" (
  "id" TEXT NOT NULL,
  "ocrJobId" TEXT NOT NULL,
  "extractedTextHash" TEXT,
  "extractedTextPreview" TEXT,
  "confidence" DOUBLE PRECISION,
  "pageResults" JSONB,
  "language" TEXT,
  "providerMetadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OcrResult_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OcrMetadata" (
  "id" TEXT NOT NULL,
  "ocrJobId" TEXT NOT NULL,
  "pageCount" INTEGER,
  "orientation" TEXT,
  "paperSize" TEXT,
  "language" TEXT,
  "colorUsage" JSONB,
  "blankPages" JSONB,
  "duplicatePages" JSONB,
  "imageQuality" "DocumentImageQuality" NOT NULL DEFAULT 'UNKNOWN',
  "inkUsage" JSONB,
  "printCost" DECIMAL(10,2),
  "printTimeSeconds" INTEGER,
  "fileHealth" "DocumentFileHealth" NOT NULL DEFAULT 'UNKNOWN',
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OcrMetadata_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DocumentAnalysis" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "ocrJobId" TEXT,
  "printJobFileId" TEXT,
  "summary" TEXT NOT NULL,
  "pageCount" INTEGER,
  "orientation" TEXT,
  "paperSize" TEXT,
  "language" TEXT,
  "colorUsage" JSONB,
  "blankPageCount" INTEGER NOT NULL DEFAULT 0,
  "duplicatePageCount" INTEGER NOT NULL DEFAULT 0,
  "imageQuality" "DocumentImageQuality" NOT NULL DEFAULT 'UNKNOWN',
  "estimatedInkUsage" JSONB,
  "estimatedPrintCost" DECIMAL(10,2),
  "estimatedPrintTimeSeconds" INTEGER,
  "fileHealth" "DocumentFileHealth" NOT NULL DEFAULT 'UNKNOWN',
  "report" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DocumentAnalysis_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OcrAnalytic" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT,
  "periodStart" TIMESTAMP(3) NOT NULL,
  "periodEnd" TIMESTAMP(3) NOT NULL,
  "jobCount" INTEGER NOT NULL DEFAULT 0,
  "completedCount" INTEGER NOT NULL DEFAULT 0,
  "failedCount" INTEGER NOT NULL DEFAULT 0,
  "pageCount" INTEGER NOT NULL DEFAULT 0,
  "totalFileBytes" INTEGER NOT NULL DEFAULT 0,
  "averageConfidence" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OcrAnalytic_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OcrAuditLog" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT,
  "actorUserId" TEXT,
  "ocrJobId" TEXT,
  "action" TEXT NOT NULL,
  "severity" "AuditSeverity" NOT NULL DEFAULT 'INFO',
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OcrAuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OcrJob_organizationId_status_queuedAt_idx" ON "OcrJob"("organizationId", "status", "queuedAt");
CREATE INDEX "OcrJob_printJobFileId_createdAt_idx" ON "OcrJob"("printJobFileId", "createdAt");
CREATE INDEX "OcrJob_aiRequestId_idx" ON "OcrJob"("aiRequestId");
CREATE INDEX "OcrJob_requestedByUserId_createdAt_idx" ON "OcrJob"("requestedByUserId", "createdAt");
CREATE UNIQUE INDEX "OcrResult_ocrJobId_key" ON "OcrResult"("ocrJobId");
CREATE UNIQUE INDEX "OcrMetadata_ocrJobId_key" ON "OcrMetadata"("ocrJobId");
CREATE UNIQUE INDEX "DocumentAnalysis_ocrJobId_key" ON "DocumentAnalysis"("ocrJobId");
CREATE INDEX "DocumentAnalysis_organizationId_createdAt_idx" ON "DocumentAnalysis"("organizationId", "createdAt");
CREATE INDEX "DocumentAnalysis_printJobFileId_createdAt_idx" ON "DocumentAnalysis"("printJobFileId", "createdAt");
CREATE INDEX "DocumentAnalysis_fileHealth_createdAt_idx" ON "DocumentAnalysis"("fileHealth", "createdAt");
CREATE UNIQUE INDEX "OcrAnalytic_organizationId_periodStart_key" ON "OcrAnalytic"("organizationId", "periodStart");
CREATE INDEX "OcrAnalytic_organizationId_periodStart_idx" ON "OcrAnalytic"("organizationId", "periodStart");
CREATE INDEX "OcrAuditLog_organizationId_createdAt_idx" ON "OcrAuditLog"("organizationId", "createdAt");
CREATE INDEX "OcrAuditLog_actorUserId_createdAt_idx" ON "OcrAuditLog"("actorUserId", "createdAt");
CREATE INDEX "OcrAuditLog_ocrJobId_createdAt_idx" ON "OcrAuditLog"("ocrJobId", "createdAt");
CREATE INDEX "OcrAuditLog_action_idx" ON "OcrAuditLog"("action");
CREATE INDEX "OcrAuditLog_severity_idx" ON "OcrAuditLog"("severity");

ALTER TABLE "OcrJob" ADD CONSTRAINT "OcrJob_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OcrJob" ADD CONSTRAINT "OcrJob_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OcrJob" ADD CONSTRAINT "OcrJob_printJobFileId_fkey" FOREIGN KEY ("printJobFileId") REFERENCES "PrintJobFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OcrJob" ADD CONSTRAINT "OcrJob_aiRequestId_fkey" FOREIGN KEY ("aiRequestId") REFERENCES "AiRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OcrResult" ADD CONSTRAINT "OcrResult_ocrJobId_fkey" FOREIGN KEY ("ocrJobId") REFERENCES "OcrJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OcrMetadata" ADD CONSTRAINT "OcrMetadata_ocrJobId_fkey" FOREIGN KEY ("ocrJobId") REFERENCES "OcrJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentAnalysis" ADD CONSTRAINT "DocumentAnalysis_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentAnalysis" ADD CONSTRAINT "DocumentAnalysis_ocrJobId_fkey" FOREIGN KEY ("ocrJobId") REFERENCES "OcrJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DocumentAnalysis" ADD CONSTRAINT "DocumentAnalysis_printJobFileId_fkey" FOREIGN KEY ("printJobFileId") REFERENCES "PrintJobFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OcrAnalytic" ADD CONSTRAINT "OcrAnalytic_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OcrAuditLog" ADD CONSTRAINT "OcrAuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OcrAuditLog" ADD CONSTRAINT "OcrAuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OcrAuditLog" ADD CONSTRAINT "OcrAuditLog_ocrJobId_fkey" FOREIGN KEY ("ocrJobId") REFERENCES "OcrJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

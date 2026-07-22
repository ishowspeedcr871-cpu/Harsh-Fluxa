-- Phase 13A AI Core Platform foundation
CREATE TYPE "AiProviderStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DEGRADED', 'DISABLED');
CREATE TYPE "AiModelStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DEPRECATED');
CREATE TYPE "AiRequestStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'TIMED_OUT');
CREATE TYPE "AiPromptTemplateStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');
CREATE TYPE "AiHealthStatus" AS ENUM ('HEALTHY', 'DEGRADED', 'UNAVAILABLE', 'UNKNOWN');

CREATE TABLE "AiProvider" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT,
  "key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "status" "AiProviderStatus" NOT NULL DEFAULT 'INACTIVE',
  "baseUrl" TEXT,
  "defaultTimeoutMs" INTEGER NOT NULL DEFAULT 30000,
  "defaultRetryCount" INTEGER NOT NULL DEFAULT 2,
  "supportsStreaming" BOOLEAN NOT NULL DEFAULT false,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "AiProvider_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiModel" (
  "id" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "status" "AiModelStatus" NOT NULL DEFAULT 'ACTIVE',
  "contextWindow" INTEGER,
  "supportsStreaming" BOOLEAN NOT NULL DEFAULT false,
  "inputModalities" JSONB,
  "outputModalities" JSONB,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "AiModel_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiConfiguration" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "defaultProviderId" TEXT,
  "defaultModelId" TEXT,
  "isEnabled" BOOLEAN NOT NULL DEFAULT false,
  "streamingEnabled" BOOLEAN NOT NULL DEFAULT false,
  "timeoutMs" INTEGER NOT NULL DEFAULT 30000,
  "retryCount" INTEGER NOT NULL DEFAULT 2,
  "rateLimitPerMinute" INTEGER NOT NULL DEFAULT 60,
  "secretPolicy" JSONB,
  "featureFlags" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AiConfiguration_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiPromptTemplate" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT,
  "key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "status" "AiPromptTemplateStatus" NOT NULL DEFAULT 'DRAFT',
  "version" INTEGER NOT NULL DEFAULT 1,
  "template" TEXT NOT NULL,
  "variables" JSONB,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "archivedAt" TIMESTAMP(3),
  CONSTRAINT "AiPromptTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiRequest" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "actorUserId" TEXT,
  "providerId" TEXT,
  "modelId" TEXT,
  "promptTemplateId" TEXT,
  "featureKey" TEXT NOT NULL,
  "status" "AiRequestStatus" NOT NULL DEFAULT 'QUEUED',
  "requestHash" TEXT NOT NULL,
  "inputTokens" INTEGER NOT NULL DEFAULT 0,
  "outputTokens" INTEGER NOT NULL DEFAULT 0,
  "totalTokens" INTEGER NOT NULL DEFAULT 0,
  "timeoutMs" INTEGER NOT NULL,
  "retryCount" INTEGER NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "streamRequested" BOOLEAN NOT NULL DEFAULT false,
  "metadata" JSONB,
  "errorCode" TEXT,
  "errorMessage" TEXT,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AiRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiResponse" (
  "id" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "responseHash" TEXT NOT NULL,
  "finishReason" TEXT,
  "latencyMs" INTEGER,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AiResponse_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiUsageStatistic" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT,
  "providerId" TEXT,
  "modelId" TEXT,
  "featureKey" TEXT NOT NULL,
  "periodStart" TIMESTAMP(3) NOT NULL,
  "periodEnd" TIMESTAMP(3) NOT NULL,
  "requestCount" INTEGER NOT NULL DEFAULT 0,
  "successCount" INTEGER NOT NULL DEFAULT 0,
  "failureCount" INTEGER NOT NULL DEFAULT 0,
  "inputTokens" INTEGER NOT NULL DEFAULT 0,
  "outputTokens" INTEGER NOT NULL DEFAULT 0,
  "totalTokens" INTEGER NOT NULL DEFAULT 0,
  "estimatedCost" DECIMAL(12,4),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AiUsageStatistic_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiProviderHealth" (
  "id" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "organizationId" TEXT,
  "status" "AiHealthStatus" NOT NULL DEFAULT 'UNKNOWN',
  "latencyMs" INTEGER,
  "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "message" TEXT,
  "metadata" JSONB,
  CONSTRAINT "AiProviderHealth_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiAuditLog" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT,
  "actorUserId" TEXT,
  "requestId" TEXT,
  "action" TEXT NOT NULL,
  "severity" "AuditSeverity" NOT NULL DEFAULT 'INFO',
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AiAuditLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AiProvider_organizationId_key_key" ON "AiProvider"("organizationId", "key");
CREATE INDEX "AiProvider_organizationId_status_idx" ON "AiProvider"("organizationId", "status");
CREATE INDEX "AiProvider_deletedAt_idx" ON "AiProvider"("deletedAt");
CREATE UNIQUE INDEX "AiModel_providerId_key_key" ON "AiModel"("providerId", "key");
CREATE INDEX "AiModel_providerId_status_idx" ON "AiModel"("providerId", "status");
CREATE INDEX "AiModel_deletedAt_idx" ON "AiModel"("deletedAt");
CREATE UNIQUE INDEX "AiConfiguration_organizationId_key" ON "AiConfiguration"("organizationId");
CREATE UNIQUE INDEX "AiPromptTemplate_organizationId_key_version_key" ON "AiPromptTemplate"("organizationId", "key", "version");
CREATE INDEX "AiPromptTemplate_organizationId_status_idx" ON "AiPromptTemplate"("organizationId", "status");
CREATE INDEX "AiRequest_organizationId_status_createdAt_idx" ON "AiRequest"("organizationId", "status", "createdAt");
CREATE INDEX "AiRequest_actorUserId_createdAt_idx" ON "AiRequest"("actorUserId", "createdAt");
CREATE INDEX "AiRequest_providerId_createdAt_idx" ON "AiRequest"("providerId", "createdAt");
CREATE INDEX "AiRequest_modelId_createdAt_idx" ON "AiRequest"("modelId", "createdAt");
CREATE INDEX "AiRequest_featureKey_createdAt_idx" ON "AiRequest"("featureKey", "createdAt");
CREATE INDEX "AiResponse_requestId_createdAt_idx" ON "AiResponse"("requestId", "createdAt");
CREATE UNIQUE INDEX "AiUsageStatistic_organizationId_providerId_modelId_featureKey_periodStart_key" ON "AiUsageStatistic"("organizationId", "providerId", "modelId", "featureKey", "periodStart");
CREATE INDEX "AiUsageStatistic_organizationId_periodStart_idx" ON "AiUsageStatistic"("organizationId", "periodStart");
CREATE INDEX "AiUsageStatistic_providerId_periodStart_idx" ON "AiUsageStatistic"("providerId", "periodStart");
CREATE INDEX "AiProviderHealth_providerId_checkedAt_idx" ON "AiProviderHealth"("providerId", "checkedAt");
CREATE INDEX "AiProviderHealth_organizationId_checkedAt_idx" ON "AiProviderHealth"("organizationId", "checkedAt");
CREATE INDEX "AiProviderHealth_status_checkedAt_idx" ON "AiProviderHealth"("status", "checkedAt");
CREATE INDEX "AiAuditLog_organizationId_createdAt_idx" ON "AiAuditLog"("organizationId", "createdAt");
CREATE INDEX "AiAuditLog_actorUserId_createdAt_idx" ON "AiAuditLog"("actorUserId", "createdAt");
CREATE INDEX "AiAuditLog_requestId_createdAt_idx" ON "AiAuditLog"("requestId", "createdAt");
CREATE INDEX "AiAuditLog_action_idx" ON "AiAuditLog"("action");
CREATE INDEX "AiAuditLog_severity_idx" ON "AiAuditLog"("severity");

ALTER TABLE "AiProvider" ADD CONSTRAINT "AiProvider_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiModel" ADD CONSTRAINT "AiModel_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "AiProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiConfiguration" ADD CONSTRAINT "AiConfiguration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiConfiguration" ADD CONSTRAINT "AiConfiguration_defaultProviderId_fkey" FOREIGN KEY ("defaultProviderId") REFERENCES "AiProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AiConfiguration" ADD CONSTRAINT "AiConfiguration_defaultModelId_fkey" FOREIGN KEY ("defaultModelId") REFERENCES "AiModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AiPromptTemplate" ADD CONSTRAINT "AiPromptTemplate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiRequest" ADD CONSTRAINT "AiRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiRequest" ADD CONSTRAINT "AiRequest_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AiRequest" ADD CONSTRAINT "AiRequest_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "AiProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AiRequest" ADD CONSTRAINT "AiRequest_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AiModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AiRequest" ADD CONSTRAINT "AiRequest_promptTemplateId_fkey" FOREIGN KEY ("promptTemplateId") REFERENCES "AiPromptTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AiResponse" ADD CONSTRAINT "AiResponse_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "AiRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiUsageStatistic" ADD CONSTRAINT "AiUsageStatistic_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiUsageStatistic" ADD CONSTRAINT "AiUsageStatistic_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "AiProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AiUsageStatistic" ADD CONSTRAINT "AiUsageStatistic_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AiModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AiProviderHealth" ADD CONSTRAINT "AiProviderHealth_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "AiProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiProviderHealth" ADD CONSTRAINT "AiProviderHealth_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiAuditLog" ADD CONSTRAINT "AiAuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AiAuditLog" ADD CONSTRAINT "AiAuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AiAuditLog" ADD CONSTRAINT "AiAuditLog_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "AiRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

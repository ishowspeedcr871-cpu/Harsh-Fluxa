-- Phase 13C AI Print Assistant, Automation Engine, AI Analytics, and Intelligent Search
CREATE TYPE "AiRecommendationStatus" AS ENUM ('ACTIVE', 'ACCEPTED', 'REJECTED', 'SUPERSEDED');
CREATE TYPE "AutomationRuleStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED');
CREATE TYPE "AutomationTriggerType" AS ENUM ('PRINT_JOB_CREATED', 'PRINT_JOB_UPDATED', 'OCR_COMPLETED', 'DOCUMENT_ANALYZED', 'SCHEDULED', 'MANUAL');
CREATE TYPE "AutomationExecutionStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'SKIPPED');
CREATE TYPE "SearchScope" AS ENUM ('ALL', 'CUSTOMERS', 'ORGANIZATIONS', 'EMPLOYEES', 'JOBS', 'FILES', 'OCR', 'AI_ANALYSIS');

CREATE TABLE "AiPrintRecommendation" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "printJobId" TEXT,
  "printJobFileId" TEXT,
  "documentAnalysisId" TEXT,
  "aiRequestId" TEXT,
  "status" "AiRecommendationStatus" NOT NULL DEFAULT 'ACTIVE',
  "recommendedPaperSize" TEXT,
  "recommendedDuplex" BOOLEAN,
  "recommendedColor" BOOLEAN,
  "recommendedOrientation" TEXT,
  "recommendedQuality" TEXT,
  "recommendedScaling" TEXT,
  "costOptimization" JSONB,
  "inkOptimization" JSONB,
  "paperSavings" JSONB,
  "environmentalImpact" JSONB,
  "confidenceScore" DOUBLE PRECISION,
  "explanations" JSONB NOT NULL,
  "createdByUserId" TEXT,
  "acceptedAt" TIMESTAMP(3),
  "rejectedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AiPrintRecommendation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiRecommendationFeedback" (
  "id" TEXT NOT NULL,
  "recommendationId" TEXT NOT NULL,
  "actorUserId" TEXT,
  "accepted" BOOLEAN NOT NULL,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AiRecommendationFeedback_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AutomationRule" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "status" "AutomationRuleStatus" NOT NULL DEFAULT 'ACTIVE',
  "triggerType" "AutomationTriggerType" NOT NULL,
  "conditions" JSONB NOT NULL,
  "actions" JSONB NOT NULL,
  "priority" INTEGER NOT NULL DEFAULT 100,
  "rateLimitPerHour" INTEGER NOT NULL DEFAULT 120,
  "lastRunAt" TIMESTAMP(3),
  "createdByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "archivedAt" TIMESTAMP(3),
  CONSTRAINT "AutomationRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AutomationExecution" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "ruleId" TEXT NOT NULL,
  "printJobId" TEXT,
  "status" "AutomationExecutionStatus" NOT NULL DEFAULT 'QUEUED',
  "matched" BOOLEAN NOT NULL DEFAULT false,
  "actionsApplied" JSONB,
  "errorCode" TEXT,
  "errorMessage" TEXT,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AutomationExecution_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SavedSearch" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "userId" TEXT,
  "name" TEXT NOT NULL,
  "scope" "SearchScope" NOT NULL DEFAULT 'ALL',
  "query" TEXT NOT NULL,
  "filters" JSONB,
  "sort" TEXT NOT NULL DEFAULT 'relevance',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SavedSearch_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SearchHistory" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT,
  "userId" TEXT,
  "scope" "SearchScope" NOT NULL DEFAULT 'ALL',
  "query" TEXT NOT NULL,
  "resultCount" INTEGER NOT NULL DEFAULT 0,
  "filters" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SearchHistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiAnalyticsSnapshot" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT,
  "periodStart" TIMESTAMP(3) NOT NULL,
  "periodEnd" TIMESTAMP(3) NOT NULL,
  "printTrends" JSONB NOT NULL,
  "organizationInsights" JSONB NOT NULL,
  "customerInsights" JSONB NOT NULL,
  "employeeProductivity" JSONB NOT NULL,
  "costOptimization" JSONB NOT NULL,
  "paperSavings" JSONB NOT NULL,
  "inkUsage" JSONB NOT NULL,
  "queueEfficiency" JSONB NOT NULL,
  "recommendationStats" JSONB NOT NULL,
  "ocrPerformance" JSONB NOT NULL,
  "systemHealth" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AiAnalyticsSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AiPrintRecommendation_organizationId_status_createdAt_idx" ON "AiPrintRecommendation"("organizationId", "status", "createdAt");
CREATE INDEX "AiPrintRecommendation_printJobId_createdAt_idx" ON "AiPrintRecommendation"("printJobId", "createdAt");
CREATE INDEX "AiPrintRecommendation_printJobFileId_createdAt_idx" ON "AiPrintRecommendation"("printJobFileId", "createdAt");
CREATE INDEX "AiRecommendationFeedback_recommendationId_createdAt_idx" ON "AiRecommendationFeedback"("recommendationId", "createdAt");
CREATE INDEX "AiRecommendationFeedback_actorUserId_createdAt_idx" ON "AiRecommendationFeedback"("actorUserId", "createdAt");
CREATE INDEX "AutomationRule_organizationId_status_triggerType_idx" ON "AutomationRule"("organizationId", "status", "triggerType");
CREATE INDEX "AutomationRule_priority_idx" ON "AutomationRule"("priority");
CREATE INDEX "AutomationExecution_organizationId_status_createdAt_idx" ON "AutomationExecution"("organizationId", "status", "createdAt");
CREATE INDEX "AutomationExecution_ruleId_createdAt_idx" ON "AutomationExecution"("ruleId", "createdAt");
CREATE INDEX "AutomationExecution_printJobId_createdAt_idx" ON "AutomationExecution"("printJobId", "createdAt");
CREATE INDEX "SavedSearch_organizationId_userId_createdAt_idx" ON "SavedSearch"("organizationId", "userId", "createdAt");
CREATE INDEX "SavedSearch_scope_idx" ON "SavedSearch"("scope");
CREATE INDEX "SearchHistory_organizationId_userId_createdAt_idx" ON "SearchHistory"("organizationId", "userId", "createdAt");
CREATE INDEX "SearchHistory_query_idx" ON "SearchHistory"("query");
CREATE UNIQUE INDEX "AiAnalyticsSnapshot_organizationId_periodStart_key" ON "AiAnalyticsSnapshot"("organizationId", "periodStart");
CREATE INDEX "AiAnalyticsSnapshot_organizationId_periodStart_idx" ON "AiAnalyticsSnapshot"("organizationId", "periodStart");

ALTER TABLE "AiPrintRecommendation" ADD CONSTRAINT "AiPrintRecommendation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiPrintRecommendation" ADD CONSTRAINT "AiPrintRecommendation_printJobId_fkey" FOREIGN KEY ("printJobId") REFERENCES "PrintJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AiPrintRecommendation" ADD CONSTRAINT "AiPrintRecommendation_printJobFileId_fkey" FOREIGN KEY ("printJobFileId") REFERENCES "PrintJobFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AiPrintRecommendation" ADD CONSTRAINT "AiPrintRecommendation_documentAnalysisId_fkey" FOREIGN KEY ("documentAnalysisId") REFERENCES "DocumentAnalysis"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AiPrintRecommendation" ADD CONSTRAINT "AiPrintRecommendation_aiRequestId_fkey" FOREIGN KEY ("aiRequestId") REFERENCES "AiRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AiPrintRecommendation" ADD CONSTRAINT "AiPrintRecommendation_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AiRecommendationFeedback" ADD CONSTRAINT "AiRecommendationFeedback_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "AiPrintRecommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiRecommendationFeedback" ADD CONSTRAINT "AiRecommendationFeedback_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AutomationRule" ADD CONSTRAINT "AutomationRule_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AutomationRule" ADD CONSTRAINT "AutomationRule_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AutomationExecution" ADD CONSTRAINT "AutomationExecution_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AutomationExecution" ADD CONSTRAINT "AutomationExecution_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "AutomationRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AutomationExecution" ADD CONSTRAINT "AutomationExecution_printJobId_fkey" FOREIGN KEY ("printJobId") REFERENCES "PrintJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SavedSearch" ADD CONSTRAINT "SavedSearch_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SavedSearch" ADD CONSTRAINT "SavedSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SearchHistory" ADD CONSTRAINT "SearchHistory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SearchHistory" ADD CONSTRAINT "SearchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AiAnalyticsSnapshot" ADD CONSTRAINT "AiAnalyticsSnapshot_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

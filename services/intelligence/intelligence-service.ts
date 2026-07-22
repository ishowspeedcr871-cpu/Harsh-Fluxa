import type { Prisma, PrintJobPriority } from "@prisma/client";
import { prisma } from "@/database/client";
import { createAiRequest } from "@/services/ai/ai-service";
import { createAiAuditLog } from "@/services/ai/audit";
import { createNotification } from "@/services/notifications/notification-service";
import { IntelligenceServiceError } from "@/services/intelligence/errors";
import {
  automationExecuteSchema,
  automationRuleSchema,
  createRecommendationSchema,
  intelligentSearchSchema,
  recommendationFeedbackSchema,
  savedSearchSchema,
  type AutomationExecuteInput,
  type AutomationRuleInput,
  type CreateRecommendationInput,
  type IntelligentSearchInput,
  type RecommendationFeedbackInput,
  type SavedSearchInput,
} from "@/features/intelligence/schemas";

const RECOMMENDATION_FEATURE_KEY = "ai_print_assistant_recommendations";

function dayBounds(date = new Date()) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

function toRecord(value: Prisma.JsonValue | null | undefined) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

async function getRecommendationContext(organizationId: string, input: CreateRecommendationInput) {
  const printJob = input.printJobId
    ? await prisma.printJob.findFirst({
        where: { id: input.printJobId, organizationId },
        include: { files: true },
      })
    : null;
  const file = input.printJobFileId
    ? await prisma.printJobFile.findFirst({
        where: { id: input.printJobFileId, printJob: { organizationId } },
        include: { printJob: true },
      })
    : printJob?.files[0]
      ? await prisma.printJobFile.findFirst({
          where: { id: printJob.files[0].id },
          include: { printJob: true },
        })
      : null;
  const analysis = input.documentAnalysisId
    ? await prisma.documentAnalysis.findFirst({
        where: { id: input.documentAnalysisId, organizationId },
        include: { printJobFile: true },
      })
    : file
      ? await prisma.documentAnalysis.findFirst({
          where: { organizationId, printJobFileId: file.id },
          orderBy: { createdAt: "desc" },
        })
      : null;
  if (!printJob && !file && !analysis)
    throw new IntelligenceServiceError(
      "A print job, file, or document analysis is required.",
      "RECOMMENDATION_CONTEXT_REQUIRED",
      422,
    );
  return { printJob: printJob ?? file?.printJob ?? null, file, analysis };
}

function buildRecommendations(context: Awaited<ReturnType<typeof getRecommendationContext>>) {
  const uploadConfig = toRecord(
    toRecord(context.printJob?.metadata).uploadConfiguration as Prisma.JsonValue,
  );
  const pageCount = context.analysis?.pageCount ?? context.printJob?.pageCount ?? 1;
  const fileHealth = context.analysis?.fileHealth ?? "UNKNOWN";
  const quality = context.analysis?.imageQuality ?? "UNKNOWN";
  const color = Boolean(context.printJob?.color ?? context.analysis?.colorUsage);
  const copies = context.printJob?.copies ?? 1;
  const duplex = pageCount > 1;
  const paperSize =
    pageCount > 20
      ? "A4"
      : typeof uploadConfig.paperSize === "string"
        ? uploadConfig.paperSize
        : "A4";
  const orientation =
    context.analysis?.orientation && context.analysis.orientation !== "unknown"
      ? context.analysis.orientation
      : "portrait";
  const qualityRecommendation = quality === "LOW" ? "standard" : color ? "premium" : "standard";
  const monoSavings = color ? pageCount * copies * 0.18 : 0;
  const duplexSheetsSaved = duplex ? Math.floor((pageCount * copies) / 2) : 0;
  const confidence = fileHealth === "HEALTHY" ? 0.86 : fileHealth === "WARNING" ? 0.68 : 0.54;
  return {
    recommendedPaperSize: paperSize,
    recommendedDuplex: duplex,
    recommendedColor: color && quality !== "LOW",
    recommendedOrientation: orientation,
    recommendedQuality: qualityRecommendation,
    recommendedScaling: "fit_to_page",
    confidenceScore: confidence,
    costOptimization: {
      estimatedSavings: Number(monoSavings.toFixed(2)),
      reason: color
        ? "Black-and-white mode can reduce toner cost for non-color-critical pages."
        : "Current color mode is already cost optimized.",
    },
    inkOptimization: {
      mode: color && quality !== "LOW" ? "selective_color" : "monochrome",
      estimatedCoverage: context.analysis?.estimatedInkUsage ?? null,
    },
    paperSavings: { duplexRecommended: duplex, estimatedSheetsSaved: duplexSheetsSaved },
    environmentalImpact: {
      estimatedSheetsSaved: duplexSheetsSaved,
      estimatedCarbonReductionGrams: duplexSheetsSaved * 4.5,
    },
    explanations: [
      {
        key: "paperSize",
        value: paperSize,
        reason: "Selected from existing document configuration and page-volume profile.",
      },
      {
        key: "duplex",
        value: duplex,
        reason: duplex
          ? "Multi-page documents can reduce paper usage with duplex printing."
          : "Single-page documents do not benefit from duplex printing.",
      },
      {
        key: "color",
        value: color && quality !== "LOW",
        reason:
          quality === "LOW"
            ? "Low image quality should avoid premium color output unless manually required."
            : "Color recommendation follows current job and document color signals.",
      },
      {
        key: "quality",
        value: qualityRecommendation,
        reason: "Quality recommendation uses document image quality and color usage signals.",
      },
    ],
  };
}

export async function createPrintAssistantRecommendation(
  organizationId: string,
  actorUserId: string | undefined,
  input: CreateRecommendationInput,
) {
  const parsed = createRecommendationSchema.parse(input);
  const context = await getRecommendationContext(organizationId, parsed);
  let aiRequestId: string | undefined;
  try {
    const aiRequest = await createAiRequest(organizationId, actorUserId, {
      featureKey: RECOMMENDATION_FEATURE_KEY,
      input: {
        printJobId: context.printJob?.id,
        printJobFileId: context.file?.id,
        documentAnalysisId: context.analysis?.id,
      },
      streamRequested: false,
      metadata: { source: "ai_print_assistant" },
    });
    aiRequestId = aiRequest.id;
  } catch {
    aiRequestId = undefined;
  }
  const recommendation = buildRecommendations(context);
  const created = await prisma.aiPrintRecommendation.create({
    data: {
      organizationId,
      printJobId: context.printJob?.id,
      printJobFileId: context.file?.id,
      documentAnalysisId: context.analysis?.id,
      aiRequestId,
      createdByUserId: actorUserId,
      ...recommendation,
    },
  });
  await createAiAuditLog({
    organizationId,
    actorUserId,
    action: "ai.print_assistant.recommendation_created",
    metadata: { recommendationId: created.id, printJobId: context.printJob?.id },
  });
  return created;
}

export async function recordRecommendationFeedback(
  organizationId: string,
  actorUserId: string | undefined,
  input: RecommendationFeedbackInput,
) {
  const parsed = recommendationFeedbackSchema.parse(input);
  const recommendation = await prisma.aiPrintRecommendation.findFirst({
    where: { id: parsed.recommendationId, organizationId },
  });
  if (!recommendation)
    throw new IntelligenceServiceError(
      "Recommendation was not found.",
      "RECOMMENDATION_NOT_FOUND",
      404,
    );
  await prisma.aiRecommendationFeedback.create({
    data: {
      recommendationId: recommendation.id,
      actorUserId,
      accepted: parsed.accepted,
      reason: parsed.reason || null,
    },
  });
  const updated = await prisma.aiPrintRecommendation.update({
    where: { id: recommendation.id },
    data: {
      status: parsed.accepted ? "ACCEPTED" : "REJECTED",
      acceptedAt: parsed.accepted ? new Date() : null,
      rejectedAt: parsed.accepted ? null : new Date(),
    },
  });
  await createAiAuditLog({
    organizationId,
    actorUserId,
    action: parsed.accepted ? "ai.recommendation.accepted" : "ai.recommendation.rejected",
    metadata: { recommendationId: recommendation.id },
  });
  return updated;
}

export async function listRecommendations(organizationId: string) {
  return prisma.aiPrintRecommendation.findMany({
    where: { organizationId },
    include: { printJob: true, printJobFile: true, documentAnalysis: true },
    orderBy: { createdAt: "desc" },
    take: 25,
  });
}

export async function createAutomationRule(
  organizationId: string,
  actorUserId: string | undefined,
  input: AutomationRuleInput,
) {
  const parsed = automationRuleSchema.parse(input);
  const rule = await prisma.automationRule.create({
    data: {
      organizationId,
      createdByUserId: actorUserId,
      name: parsed.name,
      description: parsed.description || null,
      status: parsed.status,
      triggerType: parsed.triggerType,
      conditions: parsed.conditions as Prisma.InputJsonValue,
      actions: parsed.actions as Prisma.InputJsonValue,
      priority: parsed.priority,
      rateLimitPerHour: parsed.rateLimitPerHour,
    },
  });
  await createAiAuditLog({
    organizationId,
    actorUserId,
    action: "automation.rule.created",
    metadata: { ruleId: rule.id, triggerType: rule.triggerType },
  });
  return rule;
}

function compareValue(actual: unknown, operator: string, expected: unknown) {
  if (operator === "equals") return actual === expected;
  if (operator === "not_equals") return actual !== expected;
  if (operator === "gte") return Number(actual) >= Number(expected);
  if (operator === "lte") return Number(actual) <= Number(expected);
  if (operator === "contains")
    return String(actual ?? "")
      .toLowerCase()
      .includes(String(expected).toLowerCase());
  return false;
}

async function evaluateRule(
  organizationId: string,
  rule: { conditions: Prisma.JsonValue },
  printJobId?: string,
) {
  const job = printJobId
    ? await prisma.printJob.findFirst({
        where: { id: printJobId, organizationId },
        include: { files: true },
      })
    : null;
  const latestAnalysis = job?.files[0]
    ? await prisma.documentAnalysis.findFirst({
        where: { organizationId, printJobFileId: job.files[0].id },
        orderBy: { createdAt: "desc" },
      })
    : null;
  const conditions = Array.isArray(rule.conditions)
    ? (rule.conditions as Array<Record<string, unknown>>)
    : [];
  return conditions.every((condition) => {
    const field = String(condition.field);
    const actual =
      field === "fileCount"
        ? job?.files.length
        : field === "fileHealth"
          ? latestAnalysis?.fileHealth
          : field === "imageQuality"
            ? latestAnalysis?.imageQuality
            : job?.[field as keyof typeof job];
    return compareValue(actual, String(condition.operator), condition.value);
  });
}

export async function executeAutomationRules(
  organizationId: string,
  actorUserId: string | undefined,
  input: AutomationExecuteInput,
) {
  const parsed = automationExecuteSchema.parse(input);
  const rules = await prisma.automationRule.findMany({
    where: { organizationId, status: "ACTIVE", triggerType: parsed.triggerType },
    orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
  });
  const executions: any[] = [];
  for (const rule of rules) {
    const recentCount = await prisma.automationExecution.count({
      where: {
        organizationId,
        ruleId: rule.id,
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });
    if (recentCount >= rule.rateLimitPerHour) {
      executions.push(
        await prisma.automationExecution.create({
          data: {
            organizationId,
            ruleId: rule.id,
            printJobId: parsed.printJobId || null,
            status: "SKIPPED",
            matched: false,
            errorCode: "AUTOMATION_RATE_LIMITED",
          },
        }),
      );
      continue;
    }
    const matched = await evaluateRule(organizationId, rule, parsed.printJobId || undefined);
    const execution = await prisma.automationExecution.create({
      data: {
        organizationId,
        ruleId: rule.id,
        printJobId: parsed.printJobId || null,
        status: "RUNNING",
        matched,
        startedAt: new Date(),
      },
    });
    const updated = await prisma.automationExecution.update({
      where: { id: execution.id },
      data: {
        status: "COMPLETED",
        actionsApplied: matched ? (rule.actions as Prisma.InputJsonValue) : [],
        completedAt: new Date(),
      },
    });
    await prisma.automationRule.update({ where: { id: rule.id }, data: { lastRunAt: new Date() } });
    if (matched)
      await createNotification({
        organizationId,
        audience: "ORGANIZATION",
        type: "SYSTEM_ANNOUNCEMENT",
        title: "Automation rule matched",
        message: `${rule.name} matched current print workflow conditions.`,
        entityType: "AutomationRule",
        entityId: rule.id,
      });
    executions.push(updated);
  }
  await createAiAuditLog({
    organizationId,
    actorUserId,
    action: "automation.rules.executed",
    metadata: { triggerType: parsed.triggerType, executionCount: executions.length },
  });
  return executions;
}

export async function listAutomationRules(organizationId: string) {
  return prisma.automationRule.findMany({
    where: { organizationId, archivedAt: null },
    include: { executions: { orderBy: { createdAt: "desc" }, take: 3 } },
    orderBy: [{ status: "asc" }, { priority: "asc" }],
  });
}

function score(label: string, query: string) {
  const normalized = label.toLowerCase();
  const q = query.toLowerCase();
  if (normalized === q) return 100;
  if (normalized.startsWith(q)) return 80;
  if (normalized.includes(q)) return 60;
  return 20;
}

export async function intelligentSearch(
  organizationId: string,
  actorUserId: string | undefined,
  input: IntelligentSearchInput,
) {
  const parsed = intelligentSearchSchema.parse(input);
  const contains = { contains: parsed.q, mode: "insensitive" as const };
  const results: Array<{
    type: string;
    id: string;
    title: string;
    subtitle: string;
    score: number;
    href: string;
    createdAt?: Date;
  }> = [];
  if (["ALL", "CUSTOMERS", "EMPLOYEES"].includes(parsed.scope)) {
    const users = await prisma.user.findMany({
      where: {
        memberships: { some: { organizationId } },
        OR: [{ email: contains }, { name: contains }],
      },
      take: parsed.pageSize,
    });
    results.push(
      ...users.map((user) => ({
        type: "user",
        id: user.id,
        title: user.name ?? user.email,
        subtitle: user.email,
        score: score(`${user.name ?? ""} ${user.email}`, parsed.q),
        href: `/organization/members`,
      })),
    );
  }
  if (["ALL", "JOBS"].includes(parsed.scope)) {
    const jobs = await prisma.printJob.findMany({
      where: { organizationId, OR: [{ title: contains }, { description: contains }] },
      take: parsed.pageSize,
    });
    results.push(
      ...jobs.map((job) => ({
        type: "job",
        id: job.id,
        title: job.title,
        subtitle: job.status,
        score: score(job.title, parsed.q),
        href: `/employee/queue/${job.id}`,
        createdAt: job.createdAt,
      })),
    );
  }
  if (["ALL", "FILES"].includes(parsed.scope)) {
    const files = await prisma.printJobFile.findMany({
      where: { printJob: { organizationId }, fileName: contains },
      take: parsed.pageSize,
    });
    results.push(
      ...files.map((file) => ({
        type: "file",
        id: file.id,
        title: file.fileName,
        subtitle: file.mimeType,
        score: score(file.fileName, parsed.q),
        href: `/customer/jobs/${file.printJobId}`,
        createdAt: file.createdAt,
      })),
    );
  }
  if (["ALL", "OCR", "AI_ANALYSIS"].includes(parsed.scope)) {
    const analyses = await prisma.documentAnalysis.findMany({
      where: { organizationId, summary: contains },
      take: parsed.pageSize,
    });
    results.push(
      ...analyses.map((analysis) => ({
        type: "analysis",
        id: analysis.id,
        title: analysis.summary,
        subtitle: analysis.fileHealth,
        score: score(analysis.summary, parsed.q),
        href: `/organization/ocr`,
        createdAt: analysis.createdAt,
      })),
    );
  }
  const sorted = results.sort((a, b) =>
    parsed.sort === "oldest"
      ? Number(a.createdAt) - Number(b.createdAt)
      : parsed.sort === "newest"
        ? Number(b.createdAt) - Number(a.createdAt)
        : b.score - a.score,
  );
  await prisma.searchHistory.create({
    data: {
      organizationId,
      userId: actorUserId,
      scope: parsed.scope,
      query: parsed.q,
      resultCount: sorted.length,
    },
  });
  return {
    results: sorted.slice((parsed.page - 1) * parsed.pageSize, parsed.page * parsed.pageSize),
    total: sorted.length,
    page: parsed.page,
    pageSize: parsed.pageSize,
  };
}

export async function saveSearch(
  organizationId: string,
  actorUserId: string | undefined,
  input: SavedSearchInput,
) {
  const parsed = savedSearchSchema.parse(input);
  return prisma.savedSearch.create({
    data: {
      organizationId,
      userId: actorUserId,
      name: parsed.name,
      scope: parsed.scope,
      query: parsed.q,
      sort: parsed.sort,
    },
  });
}

export async function getAiAnalyticsDashboard(organizationId: string | null) {
  const where = organizationId ? { organizationId } : {};
  const [jobs, recommendations, automations, ocr, aiRequests, recentSearches] =
    await prisma.$transaction([
      prisma.printJob.findMany({ where, take: 200, orderBy: { createdAt: "desc" } }),
      prisma.aiPrintRecommendation.findMany({ where, take: 200, orderBy: { createdAt: "desc" } }),
      prisma.automationExecution.findMany({
        where,
        include: { rule: true },
        take: 200,
        orderBy: { createdAt: "desc" },
      }),
      prisma.ocrJob.findMany({ where, take: 200, orderBy: { createdAt: "desc" } }),
      prisma.aiRequest.findMany({ where, take: 200, orderBy: { createdAt: "desc" } }),
      prisma.searchHistory.findMany({
        where: organizationId ? { organizationId } : {},
        take: 25,
        orderBy: { createdAt: "desc" },
      }),
    ]);
  const accepted = recommendations.filter((item) => item.status === "ACCEPTED").length;
  const activeAutomations = automations.filter(
    (item) => item.status === "COMPLETED" && item.matched,
  ).length;
  const ocrCompleted = ocr.filter((job) => job.status === "COMPLETED").length;
  const totalCost = jobs.reduce((sum, job) => sum + Number(job.estimatedCost ?? 0), 0);
  return {
    jobs,
    recommendations,
    automations,
    ocr,
    aiRequests,
    recentSearches,
    metrics: {
      printTrendCount: jobs.length,
      totalCost,
      acceptedRecommendations: accepted,
      recommendationAcceptanceRate: recommendations.length ? accepted / recommendations.length : 0,
      activeAutomations,
      ocrCompletionRate: ocr.length ? ocrCompleted / ocr.length : 0,
      aiRequestFailures: aiRequests.filter((request) => request.status === "FAILED").length,
    },
  };
}

export async function captureAiAnalyticsSnapshot(organizationId: string | null) {
  const { start, end } = dayBounds();
  const dashboard = await getAiAnalyticsDashboard(organizationId);
  const payload = {
    printTrends: { jobCount: dashboard.metrics.printTrendCount },
    organizationInsights: { totalCost: dashboard.metrics.totalCost },
    customerInsights: { recentSearches: dashboard.recentSearches.length },
    employeeProductivity: { automationMatches: dashboard.metrics.activeAutomations },
    costOptimization: { acceptedRecommendations: dashboard.metrics.acceptedRecommendations },
    paperSavings: {
      duplexRecommendations: dashboard.recommendations.filter((item) => item.recommendedDuplex)
        .length,
    },
    inkUsage: {
      colorRecommendations: dashboard.recommendations.filter((item) => item.recommendedColor)
        .length,
    },
    queueEfficiency: { automationExecutions: dashboard.automations.length },
    recommendationStats: { acceptanceRate: dashboard.metrics.recommendationAcceptanceRate },
    ocrPerformance: { completionRate: dashboard.metrics.ocrCompletionRate },
    systemHealth: { aiRequestFailures: dashboard.metrics.aiRequestFailures },
  };
  const existing = await prisma.aiAnalyticsSnapshot.findFirst({
    where: { organizationId, periodStart: start },
  });
  if (existing)
    return prisma.aiAnalyticsSnapshot.update({ where: { id: existing.id }, data: payload });
  return prisma.aiAnalyticsSnapshot.create({
    data: { organizationId, periodStart: start, periodEnd: end, ...payload },
  });
}

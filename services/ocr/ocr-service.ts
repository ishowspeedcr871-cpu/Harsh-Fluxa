import { createHash } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/database/client";
import { createAiRequest, recordAiError } from "@/services/ai/ai-service";
import { AiServiceError } from "@/services/ai/errors";
import { OcrServiceError } from "@/services/ocr/errors";
import { createOcrAuditLog } from "@/services/ocr/audit";
import {
  createOcrJobSchema,
  ocrListQuerySchema,
  processOcrJobSchema,
  previewQuerySchema,
  type CreateOcrJobInput,
  type OcrListQuery,
  type PreviewQuery,
  type ProcessOcrJobInput,
} from "@/features/ocr/schemas";

const OCR_FEATURE_KEY = "ocr_document_intelligence";
const SUPPORTED_MIME_TYPES = new Set(["application/pdf", "image/png", "image/jpeg", "image/webp"]);

function dayBounds(date = new Date()) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

function hashValue(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function inferFileHealth(file: { fileSize: number; mimeType: string; storageKey: string | null }) {
  if (!SUPPORTED_MIME_TYPES.has(file.mimeType)) return "CRITICAL" as const;
  if (!file.storageKey) return "WARNING" as const;
  if (file.fileSize > 75 * 1024 * 1024) return "WARNING" as const;
  return "HEALTHY" as const;
}

function inferImageQuality(fileSize: number) {
  if (fileSize >= 5 * 1024 * 1024) return "HIGH" as const;
  if (fileSize >= 750 * 1024) return "MEDIUM" as const;
  if (fileSize > 0) return "LOW" as const;
  return "UNKNOWN" as const;
}

function estimatePrintMetrics(input: {
  pageCount: number;
  fileSize: number;
  mimeType: string;
  color: boolean;
  copies: number;
}) {
  const colorMultiplier = input.color || input.mimeType.startsWith("image/") ? 2.25 : 1;
  const sizeMultiplier = Math.min(2.5, Math.max(1, input.fileSize / (2 * 1024 * 1024)));
  const estimatedInkCoverage = Math.min(95, Math.round(12 * colorMultiplier * sizeMultiplier));
  return {
    inkUsage: {
      estimatedCoveragePercent: estimatedInkCoverage,
      mode: colorMultiplier > 1 ? "color" : "mono",
    },
    cost: Math.max(0.5, input.pageCount * input.copies * 0.14 * colorMultiplier),
    seconds: Math.max(20, input.pageCount * input.copies * (colorMultiplier > 1 ? 8 : 5)),
  };
}

function buildAnalysisReport(file: {
  fileName: string;
  fileSize: number;
  mimeType: string;
  storageKey: string | null;
  printJob?: {
    pageCount: number | null;
    color: boolean;
    copies: number;
    metadata: Prisma.JsonValue;
  } | null;
}) {
  const configuration =
    file.printJob?.metadata &&
    typeof file.printJob.metadata === "object" &&
    !Array.isArray(file.printJob.metadata)
      ? (file.printJob.metadata as Record<string, unknown>).uploadConfiguration
      : undefined;
  const uploadConfiguration =
    configuration && typeof configuration === "object" && !Array.isArray(configuration)
      ? (configuration as Record<string, unknown>)
      : {};
  const pageCount = file.printJob?.pageCount ?? 1;
  const orientation =
    typeof uploadConfiguration.orientation === "string"
      ? uploadConfiguration.orientation
      : "unknown";
  const paperSize =
    typeof uploadConfiguration.paperSize === "string" ? uploadConfiguration.paperSize : "unknown";
  const fileHealth = inferFileHealth(file);
  const imageQuality = inferImageQuality(file.fileSize);
  const metrics = estimatePrintMetrics({
    pageCount,
    fileSize: file.fileSize,
    mimeType: file.mimeType,
    color: file.printJob?.color ?? file.mimeType.startsWith("image/"),
    copies: file.printJob?.copies ?? 1,
  });
  return {
    pageCount,
    orientation,
    paperSize,
    language: "unknown",
    colorUsage: metrics.inkUsage,
    blankPageCount: 0,
    duplicatePageCount: 0,
    imageQuality,
    estimatedInkUsage: metrics.inkUsage,
    estimatedPrintCost: metrics.cost,
    estimatedPrintTimeSeconds: metrics.seconds,
    fileHealth,
    summary:
      fileHealth === "HEALTHY"
        ? `${file.fileName} is ready for OCR processing and print-intelligence analysis.`
        : `${file.fileName} requires source-file availability or validation before full OCR extraction can run.`,
    report: {
      source: "print_job_file_metadata",
      contentHash: hashValue({
        name: file.fileName,
        size: file.fileSize,
        mimeType: file.mimeType,
        storageKey: file.storageKey,
      }),
      requiresBinarySourceForTextExtraction: !file.storageKey,
      supportedMimeType: SUPPORTED_MIME_TYPES.has(file.mimeType),
    },
  };
}

async function assertTenantFile(organizationId: string, printJobFileId: string) {
  const file = await prisma.printJobFile.findFirst({
    where: { id: printJobFileId, printJob: { organizationId } },
    include: { printJob: true },
  });
  if (!file)
    throw new OcrServiceError(
      "Print job file was not found for this organization.",
      "OCR_FILE_NOT_FOUND",
      404,
    );
  if (!SUPPORTED_MIME_TYPES.has(file.mimeType))
    throw new OcrServiceError(
      "This file type is not supported for OCR.",
      "OCR_UNSUPPORTED_FILE_TYPE",
      422,
    );
  return file;
}

async function createLinkedAiRequest(
  organizationId: string,
  actorUserId: string | undefined,
  input: {
    printJobFileId: string;
    mimeType: string;
    fileSize: number;
    timeoutMs: number;
    retryCount: number;
    requestedFeatures: Record<string, boolean>;
  },
) {
  try {
    return await createAiRequest(organizationId, actorUserId, {
      featureKey: OCR_FEATURE_KEY,
      input: {
        printJobFileId: input.printJobFileId,
        mimeType: input.mimeType,
        fileSize: input.fileSize,
      },
      streamRequested: false,
      timeoutMs: input.timeoutMs,
      retryCount: input.retryCount,
      metadata: { source: "ocr_job", requestedFeatures: input.requestedFeatures },
    });
  } catch (error) {
    if (
      error instanceof AiServiceError &&
      ["AI_DISABLED", "AI_PROVIDER_REQUIRED"].includes(error.code)
    ) {
      await createOcrAuditLog({
        organizationId,
        actorUserId,
        action: "ocr.ai_request.skipped",
        severity: "WARNING",
        metadata: { code: error.code, message: error.message },
      });
      return null;
    }
    throw error;
  }
}

export async function createOcrJob(
  organizationId: string,
  actorUserId: string | undefined,
  input: CreateOcrJobInput,
) {
  const parsed = createOcrJobSchema.parse(input);
  const file = await assertTenantFile(organizationId, parsed.printJobFileId);
  const aiRequest = await createLinkedAiRequest(organizationId, actorUserId, {
    printJobFileId: file.id,
    mimeType: file.mimeType,
    fileSize: file.fileSize,
    timeoutMs: parsed.timeoutMs,
    retryCount: parsed.maxAttempts - 1,
    requestedFeatures: parsed.requestedFeatures,
  });
  const job = await prisma.ocrJob.create({
    data: {
      organizationId,
      requestedByUserId: actorUserId,
      printJobFileId: file.id,
      aiRequestId: aiRequest?.id,
      priority: parsed.priority,
      languageHint: parsed.languageHint || null,
      timeoutMs: parsed.timeoutMs,
      maxAttempts: parsed.maxAttempts,
      requestedFeatures: parsed.requestedFeatures,
      metadata: { fileName: file.fileName, mimeType: file.mimeType, fileSize: file.fileSize },
    },
  });
  await createOcrAuditLog({
    organizationId,
    actorUserId,
    ocrJobId: job.id,
    action: "ocr.job.created",
    metadata: { printJobFileId: file.id, aiRequestId: aiRequest?.id },
  });
  return job;
}

export async function processOcrJob(
  organizationId: string,
  actorUserId: string | undefined,
  input: ProcessOcrJobInput,
) {
  const parsed = processOcrJobSchema.parse(input);
  const job = await prisma.ocrJob.findFirst({
    where: { id: parsed.ocrJobId, organizationId },
    include: { printJobFile: { include: { printJob: true } } },
  });
  if (!job)
    throw new OcrServiceError(
      "OCR job was not found for this organization.",
      "OCR_JOB_NOT_FOUND",
      404,
    );
  if (!job.printJobFile)
    throw new OcrServiceError(
      "OCR job no longer has an attached source file.",
      "OCR_SOURCE_MISSING",
      409,
    );
  if (!["QUEUED", "RETRYING", "FAILED"].includes(job.status))
    throw new OcrServiceError(
      "OCR job is not in a processable state.",
      "OCR_INVALID_JOB_STATE",
      409,
    );

  const started = await prisma.ocrJob.update({
    where: { id: job.id },
    data: {
      status: "PROCESSING",
      startedAt: new Date(),
      attemptCount: { increment: 1 },
      errorCode: null,
      errorMessage: null,
    },
  });
  const analysis = buildAnalysisReport(job.printJobFile);

  if (!job.printJobFile.storageKey) {
    const nextRetryAt =
      started.attemptCount + 1 < started.maxAttempts ? new Date(Date.now() + 15 * 60 * 1000) : null;
    const status = nextRetryAt ? "RETRYING" : "FAILED";
    const updated = await prisma.ocrJob.update({
      where: { id: job.id },
      data: {
        status,
        errorCode: "OCR_SOURCE_UNAVAILABLE",
        errorMessage: "Binary document source is required before text extraction can run.",
        nextRetryAt,
        completedAt: status === "FAILED" ? new Date() : null,
      },
    });
    await upsertDocumentAnalysis(organizationId, job.id, job.printJobFile.id, analysis);
    await recordOcrAnalytic(organizationId, false, analysis.pageCount, job.printJobFile.fileSize);
    if (job.aiRequestId)
      await recordAiError(
        job.aiRequestId,
        "OCR_SOURCE_UNAVAILABLE",
        "Binary document source is required before text extraction can run.",
      );
    await createOcrAuditLog({
      organizationId,
      actorUserId,
      ocrJobId: job.id,
      action: "ocr.job.retry_or_failed",
      severity: "WARNING",
      metadata: { status, nextRetryAt },
    });
    return updated;
  }

  const completed = await prisma.$transaction(async (tx) => {
    await tx.ocrMetadata.upsert({
      where: { ocrJobId: job.id },
      update: {
        pageCount: analysis.pageCount,
        orientation: analysis.orientation,
        paperSize: analysis.paperSize,
        language: analysis.language,
        colorUsage: analysis.colorUsage,
        imageQuality: analysis.imageQuality,
        inkUsage: analysis.estimatedInkUsage,
        printCost: analysis.estimatedPrintCost,
        printTimeSeconds: analysis.estimatedPrintTimeSeconds,
        fileHealth: analysis.fileHealth,
        metadata: analysis.report,
      },
      create: {
        ocrJobId: job.id,
        pageCount: analysis.pageCount,
        orientation: analysis.orientation,
        paperSize: analysis.paperSize,
        language: analysis.language,
        colorUsage: analysis.colorUsage,
        imageQuality: analysis.imageQuality,
        inkUsage: analysis.estimatedInkUsage,
        printCost: analysis.estimatedPrintCost,
        printTimeSeconds: analysis.estimatedPrintTimeSeconds,
        fileHealth: analysis.fileHealth,
        metadata: analysis.report,
      },
    });
    await tx.ocrResult.upsert({
      where: { ocrJobId: job.id },
      update: {
        confidence: null,
        language: analysis.language,
        providerMetadata: {
          textExtractionStatus: "not_extracted",
          reason: "external_provider_response_required",
        },
      },
      create: {
        ocrJobId: job.id,
        confidence: null,
        language: analysis.language,
        providerMetadata: {
          textExtractionStatus: "not_extracted",
          reason: "external_provider_response_required",
        },
      },
    });
    await tx.documentAnalysis.upsert({
      where: { ocrJobId: job.id },
      update: { ...analysis, organizationId, printJobFileId: job.printJobFile!.id },
      create: {
        ...analysis,
        organizationId,
        ocrJobId: job.id,
        printJobFileId: job.printJobFile!.id,
      },
    });
    return tx.ocrJob.update({
      where: { id: job.id },
      data: { status: "COMPLETED", completedAt: new Date(), errorCode: null, errorMessage: null },
    });
  });
  await recordOcrAnalytic(organizationId, true, analysis.pageCount, job.printJobFile.fileSize);
  await createOcrAuditLog({
    organizationId,
    actorUserId,
    ocrJobId: job.id,
    action: "ocr.job.completed",
    metadata: { fileHealth: analysis.fileHealth, pageCount: analysis.pageCount },
  });
  return completed;
}

async function upsertDocumentAnalysis(
  organizationId: string,
  ocrJobId: string,
  printJobFileId: string,
  analysis: ReturnType<typeof buildAnalysisReport>,
) {
  await prisma.documentAnalysis.upsert({
    where: { ocrJobId },
    update: { ...analysis, organizationId, printJobFileId },
    create: { ...analysis, organizationId, ocrJobId, printJobFileId },
  });
  await prisma.ocrMetadata.upsert({
    where: { ocrJobId },
    update: {
      pageCount: analysis.pageCount,
      orientation: analysis.orientation,
      paperSize: analysis.paperSize,
      language: analysis.language,
      colorUsage: analysis.colorUsage,
      imageQuality: analysis.imageQuality,
      inkUsage: analysis.estimatedInkUsage,
      printCost: analysis.estimatedPrintCost,
      printTimeSeconds: analysis.estimatedPrintTimeSeconds,
      fileHealth: analysis.fileHealth,
      metadata: analysis.report,
    },
    create: {
      ocrJobId,
      pageCount: analysis.pageCount,
      orientation: analysis.orientation,
      paperSize: analysis.paperSize,
      language: analysis.language,
      colorUsage: analysis.colorUsage,
      imageQuality: analysis.imageQuality,
      inkUsage: analysis.estimatedInkUsage,
      printCost: analysis.estimatedPrintCost,
      printTimeSeconds: analysis.estimatedPrintTimeSeconds,
      fileHealth: analysis.fileHealth,
      metadata: analysis.report,
    },
  });
}

async function recordOcrAnalytic(
  organizationId: string,
  completed: boolean,
  pageCount: number,
  fileBytes: number,
) {
  const { start, end } = dayBounds();
  const existing = await prisma.ocrAnalytic.findFirst({
    where: { organizationId, periodStart: start },
  });
  if (existing) {
    await prisma.ocrAnalytic.update({
      where: { id: existing.id },
      data: {
        jobCount: { increment: 1 },
        completedCount: { increment: completed ? 1 : 0 },
        failedCount: { increment: completed ? 0 : 1 },
        pageCount: { increment: pageCount },
        totalFileBytes: { increment: fileBytes },
      },
    });
    return;
  }
  await prisma.ocrAnalytic.create({
    data: {
      organizationId,
      periodStart: start,
      periodEnd: end,
      jobCount: 1,
      completedCount: completed ? 1 : 0,
      failedCount: completed ? 0 : 1,
      pageCount,
      totalFileBytes: fileBytes,
    },
  });
}

export async function listOcrJobs(organizationId: string | null, input: OcrListQuery) {
  const query = ocrListQuerySchema.parse(input);
  const where = {
    ...(organizationId ? { organizationId } : {}),
    ...(query.status === "all" ? {} : { status: query.status }),
    ...(query.q
      ? { printJobFile: { fileName: { contains: query.q, mode: "insensitive" as const } } }
      : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.ocrJob.findMany({
      where,
      include: {
        organization: true,
        requestedByUser: true,
        printJobFile: true,
        analysis: true,
        result: true,
      },
      orderBy: { queuedAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.ocrJob.count({ where }),
  ]);
  return {
    items,
    total,
    page: query.page,
    pageSize: query.pageSize,
    pageCount: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export async function getOcrJob(organizationId: string, ocrJobId: string) {
  const job = await prisma.ocrJob.findFirst({
    where: { id: ocrJobId, organizationId },
    include: {
      printJobFile: true,
      result: true,
      documentMetadata: true,
      analysis: true,
      auditLogs: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!job)
    throw new OcrServiceError(
      "OCR job was not found for this organization.",
      "OCR_JOB_NOT_FOUND",
      404,
    );
  return job;
}

export async function listDocumentAnalyses(organizationId: string | null, input: OcrListQuery) {
  const query = ocrListQuerySchema.parse(input);
  const where = {
    ...(organizationId ? { organizationId } : {}),
    ...(query.q
      ? { printJobFile: { fileName: { contains: query.q, mode: "insensitive" as const } } }
      : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.documentAnalysis.findMany({
      where,
      include: { organization: true, printJobFile: true, ocrJob: true },
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.documentAnalysis.count({ where }),
  ]);
  return { items, total, page: query.page, pageSize: query.pageSize };
}

export async function getPreviewMetadata(organizationId: string, input: PreviewQuery) {
  const query = previewQuerySchema.parse(input);
  const job = query.ocrJobId
    ? await getOcrJob(organizationId, query.ocrJobId)
    : query.printJobFileId
      ? await prisma.ocrJob.findFirst({
          where: { organizationId, printJobFileId: query.printJobFileId },
          include: { printJobFile: true, result: true, documentMetadata: true, analysis: true },
        })
      : null;
  if (!job)
    throw new OcrServiceError("Preview metadata was not found.", "OCR_PREVIEW_NOT_FOUND", 404);
  const thumbnails = Array.from(
    { length: Math.max(1, job.documentMetadata?.pageCount ?? job.analysis?.pageCount ?? 1) },
    (_, index) => ({
      page: index + 1,
      thumbnailUrl: job.printJobFile?.previewUrl ?? null,
      rotation: 0,
      zoomLevels: [50, 75, 100, 125, 150, 200],
    }),
  );
  return {
    jobId: job.id,
    fileName: job.printJobFile?.fileName,
    status: job.status,
    thumbnails,
    metadata: job.documentMetadata,
    analysis: job.analysis,
    textPreview: job.result?.extractedTextPreview ?? null,
  };
}

export async function getOcrDashboard(organizationId: string) {
  const [queued, completed, failed, jobs, analyses, analytics, availableFiles] =
    await prisma.$transaction([
      prisma.ocrJob.count({
        where: { organizationId, status: { in: ["QUEUED", "PROCESSING", "RETRYING"] } },
      }),
      prisma.ocrJob.count({ where: { organizationId, status: "COMPLETED" } }),
      prisma.ocrJob.count({ where: { organizationId, status: "FAILED" } }),
      prisma.ocrJob.findMany({
        where: { organizationId },
        include: { printJobFile: true, analysis: true },
        orderBy: { queuedAt: "desc" },
        take: 10,
      }),
      prisma.documentAnalysis.findMany({
        where: { organizationId },
        include: { printJobFile: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.ocrAnalytic.findMany({
        where: { organizationId },
        orderBy: { periodStart: "desc" },
        take: 14,
      }),
      prisma.printJobFile.findMany({
        where: { printJob: { organizationId } },
        include: { printJob: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);
  return { queued, completed, failed, jobs, analyses, analytics, availableFiles };
}

export async function getPlatformOcrDashboard() {
  const [jobs, analyses, analytics, errors] = await prisma.$transaction([
    prisma.ocrJob.findMany({
      include: { organization: true, printJobFile: true, analysis: true },
      orderBy: { queuedAt: "desc" },
      take: 25,
    }),
    prisma.documentAnalysis.findMany({
      include: { organization: true, printJobFile: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.ocrAnalytic.findMany({
      include: { organization: true },
      orderBy: { periodStart: "desc" },
      take: 20,
    }),
    prisma.ocrJob.findMany({
      where: { status: "FAILED" },
      include: { organization: true, printJobFile: true },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
  ]);
  return { jobs, analyses, analytics, errors };
}

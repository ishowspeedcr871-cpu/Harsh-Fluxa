import type { AuditSeverity, Prisma } from "@prisma/client";
import { prisma } from "@/database/client";
import { createAuditLog } from "@/services/audit/log";

export async function createOcrAuditLog(input: {
  organizationId?: string;
  actorUserId?: string;
  ocrJobId?: string;
  action: string;
  severity?: AuditSeverity;
  metadata?: Prisma.InputJsonValue;
}) {
  const severity = input.severity ?? "INFO";
  await prisma.ocrAuditLog.create({
    data: {
      organizationId: input.organizationId,
      actorUserId: input.actorUserId,
      ocrJobId: input.ocrJobId,
      action: input.action,
      severity,
      metadata: input.metadata,
    },
  });
  await createAuditLog({
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: input.action,
    entityType: "OcrJob",
    entityId: input.ocrJobId,
    severity,
    metadata: input.metadata,
  });
}

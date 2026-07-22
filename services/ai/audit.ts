import type { AuditSeverity, Prisma } from "@prisma/client";
import { prisma } from "@/database/client";
import { createAuditLog } from "@/services/audit/log";

export async function createAiAuditLog(input: {
  organizationId?: string;
  actorUserId?: string;
  requestId?: string;
  action: string;
  severity?: AuditSeverity;
  metadata?: Prisma.InputJsonValue;
}) {
  const severity = input.severity ?? "INFO";
  await prisma.aiAuditLog.create({
    data: {
      organizationId: input.organizationId,
      actorUserId: input.actorUserId,
      requestId: input.requestId,
      action: input.action,
      severity,
      metadata: input.metadata,
    },
  });
  await createAuditLog({
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: input.action,
    entityType: "AiPlatform",
    entityId: input.requestId,
    severity,
    metadata: input.metadata,
  });
}

import type { AuditSeverity, Prisma } from "@prisma/client";
import { prisma } from "@/database/client";

type CreateAuditLogInput = {
  action: string;
  organizationId?: string;
  actorUserId?: string;
  entityType?: string;
  entityId?: string;
  severity?: AuditSeverity;
  metadata?: Prisma.InputJsonValue;
};

export async function createAuditLog({ severity = "INFO", ...input }: CreateAuditLogInput) {
  try {
    return await prisma.auditLog.create({
      data: {
        action: input.action,
        organizationId: input.organizationId,
        actorUserId: input.actorUserId,
        entityType: input.entityType,
        entityId: input.entityId,
        severity,
        metadata: input.metadata,
      },
    });
  } catch (err) {
    console.error("Failed to create audit log in DB:", err);
    return null;
  }
}

import { prisma } from "@/database/client";
import {
  ORGANIZATION_PERMISSIONS,
  requireOrganizationPermission,
} from "@/services/authorization/guards";

export async function listOrganizationAuditLogs(page = 1, pageSize = 25) {
  const { organization } = await requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.AUDIT_LOGS_READ,
  );
  const skip = (page - 1) * pageSize;
  const [logs, total] = await prisma.$transaction([
    prisma.auditLog.findMany({
      where: { organizationId: organization.id },
      include: { actorUser: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.auditLog.count({ where: { organizationId: organization.id } }),
  ]);
  return { logs, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

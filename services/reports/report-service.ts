import type { Prisma } from "@prisma/client";
import { prisma } from "@/database/client";
import { reportQuerySchema } from "@/features/reports/schemas";
import type { ReportQuery } from "@/features/reports/schemas";
import { createAuditLog } from "@/services/audit/log";
import { requireActiveOrganization } from "@/services/authorization/guards";

export async function generateOrganizationJobReport(input: ReportQuery) {
  const { session, organization } = await requireActiveOrganization();
  const query = reportQuerySchema.parse(input);
  const skip = (query.page - 1) * query.pageSize;
  const dateRange: Prisma.DateTimeFilter = {
    ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
    ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
  };
  const where: Prisma.PrintJobWhereInput = {
    organizationId: organization.id,
    ...(Object.keys(dateRange).length ? { createdAt: dateRange } : {}),
    ...(query.status === "all" ? {} : { status: query.status }),
    ...(query.q
      ? {
          OR: [
            { title: { contains: query.q, mode: "insensitive" } },
            { customerUser: { email: { contains: query.q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };
  const orderBy: Prisma.PrintJobOrderByWithRelationInput =
    query.sort === "title"
      ? { title: query.direction }
      : query.sort === "status"
        ? { status: query.direction }
        : query.sort === "priority"
          ? { priority: query.direction }
          : query.sort === "estimatedCost"
            ? { estimatedCost: query.direction }
            : { createdAt: query.direction };

  const [jobs, total, summary] = await prisma.$transaction([
    prisma.printJob.findMany({
      where,
      include: { customerUser: true, assignedUser: true, printer: true, files: true },
      orderBy,
      skip,
      take: query.pageSize,
    }),
    prisma.printJob.count({ where }),
    prisma.printJob.aggregate({ where, _sum: { estimatedCost: true }, _count: { _all: true } }),
  ]);

  await createAuditLog({
    organizationId: organization.id,
    actorUserId: session.userId,
    action: query.exportFormat ? "report.export_prepared" : "report.generated",
    entityType: "PrintJobReport",
    metadata: { ...query, exportFormat: query.exportFormat ?? "interactive" },
  });

  return {
    jobs,
    total,
    page: query.page,
    pageSize: query.pageSize,
    pageCount: Math.max(1, Math.ceil(total / query.pageSize)),
    summary: {
      jobs: summary._count._all,
      revenue: Number(summary._sum.estimatedCost ?? 0),
    },
    exportFoundation: query.exportFormat
      ? {
          format: query.exportFormat,
          status: "prepared",
          message: `${query.exportFormat.toUpperCase()} export pipeline foundation is ready for background generation.`,
        }
      : null,
  };
}

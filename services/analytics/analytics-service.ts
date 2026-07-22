import { prisma } from "@/database/client";
import { getCurrentSession } from "@/services/auth/session";
import { requireActiveOrganization } from "@/services/authorization/guards";
import { requireCustomerContext } from "@/services/customer/customer-service";
import { getMasterDeveloperSession } from "@/services/developer/master-auth";

type Period = "day" | "week" | "month";

function periodStart(period: Period) {
  const date = new Date();
  if (period === "day") date.setDate(date.getDate() - 1);
  if (period === "week") date.setDate(date.getDate() - 7);
  if (period === "month") date.setMonth(date.getMonth() - 1);
  return date;
}

function decimalToNumber(value: unknown) {
  return Number(value ?? 0);
}

function groupedCount(item: { _count?: unknown }) {
  const count = item._count;
  if (typeof count === "number") return count;
  if (count && typeof count === "object" && "id" in count && typeof count.id === "number") {
    return count.id;
  }
  if (count && typeof count === "object" && "_all" in count && typeof count._all === "number") {
    return count._all;
  }
  return 0;
}

export async function getCustomerAnalytics() {
  const { session, organization } = await requireCustomerContext();
  const where = { organizationId: organization.id, customerUserId: session.userId };
  const [totalJobs, completedJobs, activeJobs, spending, recentActivity, statusDistribution] =
    await prisma.$transaction([
      prisma.printJob.count({ where }),
      prisma.printJob.count({ where: { ...where, status: "COMPLETED" } }),
      prisma.printJob.count({
        where: { ...where, status: { notIn: ["COMPLETED", "CANCELLED", "FAILED"] } },
      }),
      prisma.printJob.aggregate({ where, _sum: { estimatedCost: true } }),
      prisma.customerActivity.findMany({
        where,
        include: { printJob: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.printJob.groupBy({
        by: ["status"],
        where,
        _count: { id: true },
        orderBy: { status: "asc" },
      }),
    ]);

  return {
    totalJobs,
    completedJobs,
    activeJobs,
    spending: decimalToNumber(spending._sum.estimatedCost),
    recentActivity,
    statusDistribution: statusDistribution.map((item) => ({
      status: item.status,
      count: groupedCount(item),
    })),
  };
}

export async function getOrganizationAnalytics() {
  const { organization } = await requireActiveOrganization();
  const baseWhere = { organizationId: organization.id };
  const [
    daily,
    weekly,
    monthly,
    revenue,
    statusDistribution,
    employeeProductivity,
    printerUtilization,
  ] = await prisma.$transaction([
    prisma.printJob.count({ where: { ...baseWhere, createdAt: { gte: periodStart("day") } } }),
    prisma.printJob.count({ where: { ...baseWhere, createdAt: { gte: periodStart("week") } } }),
    prisma.printJob.count({ where: { ...baseWhere, createdAt: { gte: periodStart("month") } } }),
    prisma.printJob.aggregate({ where: baseWhere, _sum: { estimatedCost: true } }),
    prisma.printJob.groupBy({
      by: ["status"],
      where: baseWhere,
      _count: { id: true },
      orderBy: { status: "asc" },
    }),
    prisma.printJob.groupBy({
      by: ["assignedUserId"],
      where: { ...baseWhere, assignedUserId: { not: null } },
      _count: { id: true },
      orderBy: { _count: { assignedUserId: "desc" } },
      take: 10,
    }),
    prisma.printJob.groupBy({
      by: ["printerId"],
      where: { ...baseWhere, printerId: { not: null } },
      _count: { id: true },
      orderBy: { _count: { printerId: "desc" } },
      take: 10,
    }),
  ]);

  const pending = statusDistribution
    .filter((item) => !["COMPLETED", "CANCELLED", "FAILED"].includes(item.status))
    .reduce((sum, item) => sum + groupedCount(item), 0);
  const completed = groupedCount(
    statusDistribution.find((item) => item.status === "COMPLETED") ?? {},
  );

  const [employees, printers] = await prisma.$transaction([
    prisma.user.findMany({
      where: {
        id: {
          in: employeeProductivity.map((item) => item.assignedUserId).filter(Boolean) as string[],
        },
      },
      select: { id: true, email: true, name: true },
    }),
    prisma.printer.findMany({
      where: {
        id: { in: printerUtilization.map((item) => item.printerId).filter(Boolean) as string[] },
      },
      select: { id: true, name: true, status: true, health: true },
    }),
  ]);

  return {
    organization,
    volume: { daily, weekly, monthly },
    revenue: decimalToNumber(revenue._sum.estimatedCost),
    statusDistribution: statusDistribution.map((item) => ({
      status: item.status,
      count: groupedCount(item),
    })),
    pending,
    completed,
    employeeProductivity: employeeProductivity.map((item) => ({
      user: employees.find((user) => user.id === item.assignedUserId),
      jobs: groupedCount(item),
    })),
    printerUtilization: printerUtilization.map((item) => ({
      printer: printers.find((printer) => printer.id === item.printerId),
      jobs: groupedCount(item),
    })),
  };
}

export async function getPlatformAnalytics() {
  const masterSession = await getMasterDeveloperSession();
  const session = masterSession ? null : await getCurrentSession();

  if (!masterSession) {
    if (
      !session ||
      !session.user.memberships.some((membership) => membership.role.scope === "PLATFORM")
    ) {
      throw new Error("Platform analytics access denied.");
    }
  }
  const [organizations, users, totalJobs, storage, activeSessions] = await prisma.$transaction([
    prisma.organization.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.printJob.count(),
    prisma.printJobFile.aggregate({ _sum: { fileSize: true } }),
    prisma.session.count({ where: { status: "ACTIVE", expiresAt: { gt: new Date() } } }),
  ]);
  return {
    organizations,
    users,
    totalJobs,
    storageBytes: storage._sum.fileSize ?? 0,
    activeSessions,
    systemHealth: "Operational foundation",
  };
}

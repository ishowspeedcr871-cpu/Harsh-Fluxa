"use server";

import type { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/database/client";
import {
  apiKeyFoundationSchema,
  organizationImpersonationSchema,
  organizationStatusActionSchema,
  platformAnnouncementSchema,
  platformQuerySchema,
  platformSettingSchema,
  type PlatformQuery,
} from "@/features/developer/schemas";
import { createAuditLog } from "@/services/audit/log";
import { setActiveOrganizationId } from "@/services/organizations/context";
import { createNotification } from "@/services/notifications/notification-service";
import { requireMasterDeveloper } from "@/services/developer/platform-authorization";

function skip(query: PlatformQuery) {
  return (query.page - 1) * query.pageSize;
}

export async function getPlatformDashboard() {
  await requireMasterDeveloper();
  const [
    organizations,
    activeOrganizations,
    suspendedOrganizations,
    users,
    jobs,
    pendingJobs,
    auditWarnings,
    storage,
  ] = await prisma.$transaction([
    prisma.organization.count({ where: { deletedAt: null } }),
    prisma.organization.count({ where: { status: "ACTIVE", deletedAt: null } }),
    prisma.organization.count({ where: { status: "SUSPENDED", deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.printJob.count(),
    prisma.printJob.count({ where: { status: { notIn: ["COMPLETED", "CANCELLED", "FAILED"] } } }),
    prisma.auditLog.count({ where: { severity: { in: ["WARNING", "CRITICAL"] } } }),
    prisma.printJobFile.aggregate({ _sum: { fileSize: true } }),
  ]);
  return {
    organizations,
    activeOrganizations,
    suspendedOrganizations,
    users,
    jobs,
    pendingJobs,
    auditWarnings,
    storageBytes: storage._sum.fileSize ?? 0,
  };
}

export async function listPlatformOrganizations(
  input: Record<string, string | number | undefined>,
) {
  await requireMasterDeveloper();
  const query = platformQuerySchema.parse(input);
  const where: Prisma.OrganizationWhereInput = {
    deletedAt: null,
    ...(query.status === "all"
      ? {}
      : { status: query.status as Prisma.EnumOrganizationStatusFilter["equals"] }),
    ...(query.q
      ? {
          OR: [
            { name: { contains: query.q, mode: "insensitive" } },
            { slug: { contains: query.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const [organizations, total] = await prisma.$transaction([
    prisma.organization.findMany({
      where,
      include: { _count: { select: { memberships: true, printJobs: true, printers: true } } },
      orderBy: { createdAt: "desc" },
      skip: skip(query),
      take: query.pageSize,
    }),
    prisma.organization.count({ where }),
  ]);
  return {
    organizations,
    total,
    page: query.page,
    pageCount: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export async function listPlatformUsers(
  input: Record<string, string | number | undefined>,
  roleScope?: "CUSTOMER" | "ORGANIZATION" | "PLATFORM",
) {
  await requireMasterDeveloper();
  const query = platformQuerySchema.parse(input);
  const where: Prisma.UserWhereInput = {
    deletedAt: null,
    ...(query.status === "all"
      ? {}
      : { status: query.status as Prisma.EnumUserStatusFilter["equals"] }),
    ...(query.q
      ? {
          OR: [
            { email: { contains: query.q, mode: "insensitive" } },
            { name: { contains: query.q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(roleScope ? { memberships: { some: { role: { scope: roleScope } } } } : {}),
  };
  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      include: {
        memberships: { include: { organization: true, role: true } },
        _count: { select: { customerPrintJobs: true, assignedPrintJobs: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: skip(query),
      take: query.pageSize,
    }),
    prisma.user.count({ where }),
  ]);
  return {
    users,
    total,
    page: query.page,
    pageCount: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export async function listOrganizationApprovals(
  input: Record<string, string | number | undefined>,
) {
  await requireMasterDeveloper();
  const query = platformQuerySchema.parse(input);
  return listPlatformOrganizations({
    ...query,
    status: query.status === "all" ? "ACTIVE" : query.status,
  });
}

export async function setOrganizationStatusAction(formData: FormData) {
  const session = await requireMasterDeveloper();
  const parsed = organizationStatusActionSchema.parse({
    organizationId: formData.get("organizationId"),
    status: formData.get("status"),
  });
  const organization = await prisma.organization.update({
    where: { id: parsed.organizationId },
    data: { status: parsed.status },
  });
  await createAuditLog({
    organizationId: organization.id,
    metadata: { masterDeveloperId: session.id },
    action: `platform.organization.${parsed.status.toLowerCase()}`,
    entityType: "Organization",
    entityId: organization.id,
    severity: parsed.status === "SUSPENDED" ? "WARNING" : "INFO",
  });
  redirect("/developer/organizations?updated=1");
}

export async function impersonateOrganizationAction(formData: FormData) {
  const session = await requireMasterDeveloper();
  const parsed = organizationImpersonationSchema.parse({
    organizationId: formData.get("organizationId"),
  });
  await setActiveOrganizationId(parsed.organizationId);
  await createAuditLog({
    organizationId: parsed.organizationId,
    metadata: { masterDeveloperId: session.id },
    action: "platform.organization.impersonated",
    entityType: "Organization",
    entityId: parsed.organizationId,
    severity: "WARNING",
  });
  redirect("/dashboard?impersonating=1");
}

export async function listPlatformModules() {
  await requireMasterDeveloper();
  return prisma.featureModule.findMany({
    include: { _count: { select: { organizationModules: true } } },
    orderBy: { key: "asc" },
  });
}

export async function getGlobalSettings() {
  await requireMasterDeveloper();
  return prisma.platformSettings.findMany({ orderBy: { key: "asc" } });
}

export async function upsertGlobalSettingAction(formData: FormData) {
  const session = await requireMasterDeveloper();
  const parsed = platformSettingSchema.parse({
    key: formData.get("key"),
    value: formData.get("value"),
  });
  await prisma.platformSettings.upsert({
    where: { key: parsed.key },
    update: { value: parsed.value },
    create: { key: parsed.key, value: parsed.value },
  });
  await createAuditLog({
    metadata: { masterDeveloperId: session.id },
    action: "platform.setting.upserted",
    entityType: "PlatformSettings",
    entityId: parsed.key,
  });
  redirect("/developer/settings?updated=1");
}

export async function listPlatformAuditLogs(input: Record<string, string | number | undefined>) {
  await requireMasterDeveloper();
  const query = platformQuerySchema.parse(input);
  const where: Prisma.AuditLogWhereInput = query.q
    ? {
        OR: [
          { action: { contains: query.q, mode: "insensitive" } },
          { entityType: { contains: query.q, mode: "insensitive" } },
        ],
      }
    : {};
  const [logs, total] = await prisma.$transaction([
    prisma.auditLog.findMany({
      where,
      include: { organization: true, actorUser: true },
      orderBy: { createdAt: "desc" },
      skip: skip(query),
      take: query.pageSize,
    }),
    prisma.auditLog.count({ where }),
  ]);
  return {
    logs,
    total,
    page: query.page,
    pageCount: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export async function getPlatformStorage() {
  await requireMasterDeveloper();
  const [files, storage, largestFiles] = await prisma.$transaction([
    prisma.printJobFile.count(),
    prisma.printJobFile.aggregate({ _sum: { fileSize: true } }),
    prisma.printJobFile.findMany({
      include: { printJob: { include: { organization: true } } },
      orderBy: { fileSize: "desc" },
      take: 10,
    }),
  ]);
  return { files, storageBytes: storage._sum.fileSize ?? 0, largestFiles };
}

export async function getSystemHealth() {
  await requireMasterDeveloper();
  const [activeSessions, staleOtps, failedJobs, criticalAudits] = await prisma.$transaction([
    prisma.session.count({ where: { status: "ACTIVE", expiresAt: { gt: new Date() } } }),
    prisma.printJobOtp.count({ where: { status: "ACTIVE", expiresAt: { lt: new Date() } } }),
    prisma.printJob.count({ where: { status: "FAILED" } }),
    prisma.auditLog.count({ where: { severity: "CRITICAL" } }),
  ]);
  return {
    activeSessions,
    staleOtps,
    failedJobs,
    criticalAudits,
    database: "reachable",
    queue: "foundation",
    storage: "tracked",
  };
}

export async function createPlatformAnnouncementAction(formData: FormData) {
  const session = await requireMasterDeveloper();
  const parsed = platformAnnouncementSchema.parse({
    title: formData.get("title"),
    message: formData.get("message"),
    audience: formData.get("audience") || "PLATFORM",
  });
  const notification = await createNotification({
    type: "SYSTEM_ANNOUNCEMENT",
    audience: parsed.audience,
    title: parsed.title,
    message: parsed.message,
  });
  await createAuditLog({
    metadata: { masterDeveloperId: session.id },
    action: "platform.announcement.created",
    entityType: "Notification",
    entityId: notification.id,
  });
  redirect("/developer/announcements?created=1");
}

export async function listAnnouncements(input: Record<string, string | number | undefined>) {
  await requireMasterDeveloper();
  const query = platformQuerySchema.parse(input);
  const [notifications, total] = await prisma.$transaction([
    prisma.notification.findMany({
      where: { type: "SYSTEM_ANNOUNCEMENT" },
      orderBy: { createdAt: "desc" },
      skip: skip(query),
      take: query.pageSize,
    }),
    prisma.notification.count({ where: { type: "SYSTEM_ANNOUNCEMENT" } }),
  ]);
  return {
    notifications,
    total,
    page: query.page,
    pageCount: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export async function globalSearch(input: Record<string, string | number | undefined>) {
  await requireMasterDeveloper();
  const query = platformQuerySchema.parse(input);
  if (!query.q) return { organizations: [], users: [], jobs: [] };
  const [organizations, users, jobs] = await prisma.$transaction([
    prisma.organization.findMany({
      where: {
        OR: [
          { name: { contains: query.q, mode: "insensitive" } },
          { slug: { contains: query.q, mode: "insensitive" } },
        ],
      },
      take: 10,
    }),
    prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: query.q, mode: "insensitive" } },
          { name: { contains: query.q, mode: "insensitive" } },
        ],
      },
      take: 10,
    }),
    prisma.printJob.findMany({
      where: { title: { contains: query.q, mode: "insensitive" } },
      include: { organization: true, customerUser: true },
      take: 10,
    }),
  ]);
  return { organizations, users, jobs };
}

export async function getFoundationRecords() {
  await requireMasterDeveloper();
  const [settings, announcements, failedJobs, warningAudits] = await prisma.$transaction([
    prisma.platformSettings.findMany({ take: 20, orderBy: { updatedAt: "desc" } }),
    prisma.notification.findMany({
      where: { type: "SYSTEM_ANNOUNCEMENT" },
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
    prisma.printJob.findMany({
      where: { status: "FAILED" },
      include: { organization: true },
      take: 10,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.auditLog.findMany({
      where: { severity: { in: ["WARNING", "CRITICAL"] } },
      include: { organization: true, actorUser: true },
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return { settings, announcements, failedJobs, warningAudits };
}

export async function createApiKeyFoundationAction(formData: FormData) {
  const session = await requireMasterDeveloper();
  const parsed = apiKeyFoundationSchema.parse({
    name: formData.get("name"),
    scope: formData.get("scope"),
  });
  await prisma.platformSettings.upsert({
    where: { key: `api_key_foundation.${parsed.name}` },
    update: { value: { scope: parsed.scope, status: "planned" } },
    create: {
      key: `api_key_foundation.${parsed.name}`,
      value: { scope: parsed.scope, status: "planned" },
    },
  });
  await createAuditLog({
    metadata: { masterDeveloperId: session.id },
    action: "platform.api_key.foundation_created",
    entityType: "PlatformSettings",
    entityId: parsed.name,
  });
  redirect("/developer/api-keys?created=1");
}

export async function createMasterOrganizationAction(formData: FormData) {
  await requireMasterDeveloper();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/developer/settings?error=empty_name");

  const slug = String(formData.get("slug") ?? name.toLowerCase().replace(/[^a-z0-9]/g, "-")).trim();

  await prisma.organization.create({
    data: {
      name,
      slug,
      status: "ACTIVE",
      settings: { create: { displayName: name } }
    }
  });

  redirect("/developer/settings?created_org=1");
}

import { hashPassword } from "@/services/auth/password";

export async function createMasterUserAction(formData: FormData) {
  await requireMasterDeveloper();
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "customer"); // "employee", "customer", "admin"
  const organizationId = String(formData.get("organizationId") ?? "");

  if (!email || !password) {
    redirect("/developer/settings?error=missing_credentials");
  }

  try {
    const passwordHash = hashPassword(password);

    // Get or create Organization for membership
    let orgId = organizationId;
    if (!orgId) {
      const existingOrg = await prisma.organization.findFirst();
      if (existingOrg) {
        orgId = existingOrg.id;
      } else {
        const defaultOrg = await prisma.organization.create({
          data: {
            id: "mock-org",
            name: "Fluxa Digital",
            slug: "fluxa",
            status: "ACTIVE",
            settings: { create: { displayName: "Fluxa Digital" } }
          }
        });
        orgId = defaultOrg.id;
      }
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split("@")[0],
        passwordHash,
        status: "ACTIVE"
      }
    });

    if (type === "admin") {
      const adminRole = await prisma.role.upsert({
        where: { key: "platform-admin" },
        update: {},
        create: {
          key: "platform-admin",
          name: "Platform Administrator",
          scope: "PLATFORM",
          isSystem: true
        }
      });

      await prisma.membership.create({
        data: {
          userId: user.id,
          organizationId: orgId,
          roleId: adminRole.id,
          status: "ACTIVE"
        }
      });
    } else if (type === "employee") {
      const employeeRole = await prisma.role.upsert({
        where: { key: "organization-employee" },
        update: {},
        create: {
          key: "organization-employee",
          name: "Employee",
          scope: "ORGANIZATION",
          isSystem: true
        }
      });

      await prisma.membership.create({
        data: {
          userId: user.id,
          organizationId: orgId,
          roleId: employeeRole.id,
          status: "ACTIVE"
        }
      });
    } else {
      const customerRole = await prisma.role.upsert({
        where: { key: "customer-user" },
        update: {},
        create: {
          key: "customer-user",
          name: "Customer",
          scope: "CUSTOMER",
          isSystem: true
        }
      });

      await prisma.membership.create({
        data: {
          userId: user.id,
          organizationId: orgId,
          roleId: customerRole.id,
          status: "ACTIVE"
        }
      });
    }

    redirect("/developer/settings?created_user=1");
  } catch (error) {
    console.error("Failed to create user:", error);
    redirect("/developer/settings?error=user_creation_failed");
  }
}

export async function setUserStatusAction(formData: FormData) {
  const session = await requireMasterDeveloper();
  const userId = String(formData.get("userId") ?? "");
  const status = String(formData.get("status") ?? "") as any; // "ACTIVE" | "SUSPENDED" | "DELETED"

  if (!userId || !["ACTIVE", "SUSPENDED", "DELETED"].includes(status)) {
    redirect("/developer/users?error=invalid_input");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { status },
  });

  // If suspended or deleted, revoke all active sessions for this user immediately!
  if (status === "SUSPENDED" || status === "DELETED") {
    await prisma.session.deleteMany({
      where: { userId },
    });
  }

  await createAuditLog({
    metadata: { masterDeveloperId: session.id },
    action: `platform.user.${status.toLowerCase()}`,
    entityType: "User",
    entityId: userId,
    severity: status === "SUSPENDED" ? "WARNING" : "INFO",
  });

  redirect("/developer/users?updated=1");
}

export async function deleteUserAction(formData: FormData) {
  const session = await requireMasterDeveloper();
  const userId = String(formData.get("userId") ?? "");

  if (!userId) {
    redirect("/developer/users?error=invalid_input");
  }

  // Soft delete user
  await prisma.user.update({
    where: { id: userId },
    data: { 
      deletedAt: new Date(),
      status: "DELETED",
    },
  });

  // Revoke sessions
  await prisma.session.deleteMany({
    where: { userId },
  });

  // Soft delete user memberships
  await prisma.membership.updateMany({
    where: { userId },
    data: { deletedAt: new Date(), status: "REMOVED" },
  });

  await createAuditLog({
    metadata: { masterDeveloperId: session.id },
    action: "platform.user.deleted",
    entityType: "User",
    entityId: userId,
    severity: "CRITICAL",
  });

  redirect("/developer/users?updated=1");
}

export async function deleteOrganizationAction(formData: FormData) {
  const session = await requireMasterDeveloper();
  const organizationId = String(formData.get("organizationId") ?? "");

  if (!organizationId) {
    redirect("/developer/organizations?error=invalid_input");
  }

  // Soft delete organization
  await prisma.organization.update({
    where: { id: organizationId },
    data: { 
      deletedAt: new Date(),
    },
  });

  // Find all users belonging to this organization to revoke their sessions!
  const memberships = await prisma.membership.findMany({
    where: { organizationId },
    select: { userId: true },
  });
  
  const userIds = memberships.map((m) => m.userId);

  if (userIds.length > 0) {
    await prisma.session.deleteMany({
      where: { userId: { in: userIds } },
    });
  }

  // Soft delete all memberships in this organization
  await prisma.membership.updateMany({
    where: { organizationId },
    data: { deletedAt: new Date(), status: "REMOVED" },
  });

  await createAuditLog({
    organizationId,
    metadata: { masterDeveloperId: session.id },
    action: "platform.organization.deleted",
    entityType: "Organization",
    entityId: organizationId,
    severity: "CRITICAL",
  });

  redirect("/developer/organizations?updated=1");
}


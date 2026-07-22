import { prisma } from "@/database/client";
import type {
  OrganizationMemberQuery,
  UpdateMembershipInput,
} from "@/features/organizations/member-schemas";
import {
  ORGANIZATION_PERMISSIONS,
  requireOrganizationPermission,
} from "@/services/authorization/guards";
import { createAuditLog } from "@/services/audit/log";

export async function listOrganizationMembers(query: OrganizationMemberQuery) {
  const { organization } = await requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.MEMBERS_READ,
  );
  const skip = (query.page - 1) * query.pageSize;
  const where = {
    organizationId: organization.id,
    ...(query.status === "all" ? {} : { status: query.status }),
    ...(query.q
      ? {
          OR: [
            { user: { email: { contains: query.q, mode: "insensitive" as const } } },
            { user: { name: { contains: query.q, mode: "insensitive" as const } } },
            { role: { name: { contains: query.q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };
  const orderBy =
    query.sort === "email"
      ? { user: { email: query.direction } }
      : query.sort === "name"
        ? { user: { name: query.direction } }
        : query.sort === "role"
          ? { role: { name: query.direction } }
          : { createdAt: query.direction };
  const [members, total] = await prisma.$transaction([
    prisma.membership.findMany({
      where,
      include: { user: true, role: true },
      orderBy,
      skip,
      take: query.pageSize,
    }),
    prisma.membership.count({ where }),
  ]);
  return {
    members,
    total,
    page: query.page,
    pageSize: query.pageSize,
    pageCount: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export async function getOrganizationMember(membershipId: string) {
  const { organization } = await requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.MEMBERS_READ,
  );
  return prisma.membership.findFirst({
    where: { id: membershipId, organizationId: organization.id },
    include: { user: true, role: { include: { permissions: { include: { permission: true } } } } },
  });
}

export async function updateOrganizationMembership(input: UpdateMembershipInput) {
  const { session, organization } = await requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.MEMBERS_WRITE,
  );
  const membership = await prisma.membership.update({
    where: { id: input.membershipId, organizationId: organization.id },
    data: {
      roleId: input.roleId,
      status: input.status,
      deletedAt: input.status === "REMOVED" ? new Date() : null,
    },
  });
  await createAuditLog({
    organizationId: organization.id,
    actorUserId: session.userId,
    action: "membership.updated",
    entityType: "Membership",
    entityId: membership.id,
    metadata: { status: input.status, roleId: input.roleId },
  });
  return membership;
}

export async function restoreOrganizationMembership(membershipId: string) {
  const { session, organization } = await requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.MEMBERS_WRITE,
  );
  const membership = await prisma.membership.update({
    where: { id: membershipId, organizationId: organization.id },
    data: { status: "ACTIVE", deletedAt: null },
  });
  await createAuditLog({
    organizationId: organization.id,
    actorUserId: session.userId,
    action: "membership.restored",
    entityType: "Membership",
    entityId: membership.id,
  });
  return membership;
}

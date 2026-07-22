import { prisma } from "@/database/client";
import type { CreateRoleInput, UpdateRoleInput } from "@/features/organizations/member-schemas";
import {
  ORGANIZATION_PERMISSIONS,
  requireOrganizationPermission,
} from "@/services/authorization/guards";
import { createAuditLog } from "@/services/audit/log";

export const ORGANIZATION_PERMISSION_OPTIONS = Object.values(ORGANIZATION_PERMISSIONS).map(
  (key) => ({
    key,
    name: key.replace("organization.", "").replace(/_/g, " ").replace(/\./g, " · "),
  }),
);

async function upsertPermissions(permissionKeys: string[]) {
  return Promise.all(
    permissionKeys.map((key) =>
      prisma.permission.upsert({
        where: { key },
        update: {},
        create: { key, name: key, scope: "ORGANIZATION" },
      }),
    ),
  );
}

export async function ensureOrganizationOwnerPermissions(roleId: string) {
  const permissions = await upsertPermissions(Object.values(ORGANIZATION_PERMISSIONS));
  await Promise.all(
    permissions.map((permission) =>
      prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId, permissionId: permission.id } },
        update: {},
        create: { roleId, permissionId: permission.id },
      }),
    ),
  );
}

export async function listOrganizationRoles() {
  await requireOrganizationPermission(ORGANIZATION_PERMISSIONS.ROLES_READ);
  return prisma.role.findMany({
    where: { scope: "ORGANIZATION" },
    include: {
      permissions: { include: { permission: true } },
      _count: { select: { memberships: true, invitations: true } },
    },
    orderBy: [{ isSystem: "desc" }, { name: "asc" }],
  });
}

export async function createOrganizationRole(input: CreateRoleInput) {
  const { session, organization } = await requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.ROLES_WRITE,
  );
  const permissions = await upsertPermissions(input.permissions);
  const role = await prisma.role.create({
    data: {
      key: input.key,
      name: input.name,
      description: input.description || null,
      scope: "ORGANIZATION",
      permissions: { create: permissions.map((permission) => ({ permissionId: permission.id })) },
    },
  });
  await createAuditLog({
    organizationId: organization.id,
    actorUserId: session.userId,
    action: "role.created",
    entityType: "Role",
    entityId: role.id,
  });
  return role;
}

export async function updateOrganizationRole(input: UpdateRoleInput) {
  const { session, organization } = await requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.ROLES_WRITE,
  );
  const current = await prisma.role.findUnique({ where: { id: input.roleId } });
  if (!current || current.scope !== "ORGANIZATION") throw new Error("Role not found.");
  const permissions = await upsertPermissions(input.permissions);
  const role = await prisma.$transaction(async (tx) => {
    await tx.rolePermission.deleteMany({ where: { roleId: input.roleId } });
    return tx.role.update({
      where: { id: input.roleId },
      data: {
        name: input.name,
        key: current.isSystem ? current.key : input.key,
        description: input.description || null,
        permissions: { create: permissions.map((permission) => ({ permissionId: permission.id })) },
      },
    });
  });
  await createAuditLog({
    organizationId: organization.id,
    actorUserId: session.userId,
    action: "role.updated",
    entityType: "Role",
    entityId: role.id,
  });
  return role;
}

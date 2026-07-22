import { getCurrentSession } from "@/services/auth/session";

export async function getCurrentPermissionKeys() {
  const session = await getCurrentSession();
  if (!session) return new Set<string>();

  return new Set(
    session.user.memberships.flatMap((membership) =>
      membership.role.permissions.map((rolePermission) => rolePermission.permission.key),
    ),
  );
}

export async function hasPermission(permissionKey: string) {
  const permissions = await getCurrentPermissionKeys();
  return permissions.has(permissionKey);
}

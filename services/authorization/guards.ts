import { redirect } from "next/navigation";
import { getCurrentSession } from "@/services/auth/session";
import { getSelectedOrganizationId } from "@/services/organizations/context";

export const ORGANIZATION_PERMISSIONS = {
  MEMBERS_READ: "organization.members.read",
  MEMBERS_WRITE: "organization.members.write",
  INVITATIONS_READ: "organization.invitations.read",
  INVITATIONS_WRITE: "organization.invitations.write",
  ROLES_READ: "organization.roles.read",
  ROLES_WRITE: "organization.roles.write",
  AUDIT_LOGS_READ: "organization.audit_logs.read",
  QUEUE_READ: "print_queue.read",
  QUEUE_MANAGE: "print_queue.manage",
  JOB_CANCEL: "print_jobs.cancel",
  PRINTERS_READ: "printers.read",
  PRINTERS_WRITE: "printers.write",
  AI_READ: "ai.read",
  AI_MANAGE: "ai.manage",
  OCR_READ: "ocr.read",
  OCR_MANAGE: "ocr.manage",
  INTELLIGENCE_READ: "intelligence.read",
  INTELLIGENCE_MANAGE: "intelligence.manage",
} as const;

export type OrganizationPermission =
  (typeof ORGANIZATION_PERMISSIONS)[keyof typeof ORGANIZATION_PERMISSIONS];

type AuthenticatedSession = NonNullable<Awaited<ReturnType<typeof getCurrentSession>>>;
type SessionMembership = AuthenticatedSession["user"]["memberships"][number];

function collectPermissionKeys(membership: SessionMembership) {
  return new Set(
    membership.role.permissions.map((rolePermission) => rolePermission.permission.key),
  );
}

export async function requireActiveOrganization(requiredPermission?: OrganizationPermission) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const orgMemberships = session.user.memberships.filter(
    (m) => m.role.scope === "ORGANIZATION" || m.role.scope === "PLATFORM"
  );

  const selectedOrganizationId = await getSelectedOrganizationId();
  const membership = (selectedOrganizationId
    ? orgMemberships.find((item) => item.organizationId === selectedOrganizationId)
    : null) ?? orgMemberships[0];

  if (!membership || membership.organization.status === "SUSPENDED" || membership.organization.deletedAt !== null) {
    redirect("/login");
  }

  const platformMembership = session.user.memberships.find(
    (item) => item.role.scope === "PLATFORM",
  );
  const permissions = collectPermissionKeys(membership);

  const isOrganizationOwner = membership.role.key === "organization-owner";
  const isAdmin = membership.role.key === "admin" || membership.role.key === "organization-admin";
  const isEmployee = membership.role.key === "employee" || membership.role.key === "organization-employee";

  if (isEmployee) {
    permissions.add(ORGANIZATION_PERMISSIONS.QUEUE_READ);
    permissions.add(ORGANIZATION_PERMISSIONS.PRINTERS_READ);
  }

  if (isAdmin || isOrganizationOwner) {
    Object.values(ORGANIZATION_PERMISSIONS).forEach((p) => permissions.add(p));
  }

  if (
    requiredPermission &&
    !permissions.has(requiredPermission) &&
    !platformMembership &&
    !isOrganizationOwner &&
    !isAdmin
  ) {
    redirect("/dashboard?error=forbidden");
  }

  return {
    session,
    user: session.user,
    membership,
    organization: membership.organization,
    permissions,
    isPlatformContext: Boolean(platformMembership && !membership),
  };
}

export async function requireOrganizationPermission(permission: OrganizationPermission) {
  return requireActiveOrganization(permission);
}

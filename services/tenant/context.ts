import type { DatabaseAccessContext } from "@/types/database";
import { getCurrentSession } from "@/services/auth/session";
import { getSelectedOrganizationId } from "@/services/organizations/context";

export async function getTenantContext(
  organizationId?: string,
): Promise<DatabaseAccessContext | null> {
  const session = await getCurrentSession();
  if (!session) return null;

  const selectedOrganizationId = organizationId ?? (await getSelectedOrganizationId());
  const memberships = session.user.memberships;
  const selectedMembership = selectedOrganizationId
    ? memberships.find((membership) => membership.organizationId === selectedOrganizationId)
    : memberships[0];

  const isPlatformUser = memberships.some((membership) => membership.role.scope === "PLATFORM");

  if (!selectedMembership && isPlatformUser) {
    return { userId: session.userId, isPlatformContext: true };
  }

  if (!selectedMembership) return null;

  return { organizationId: selectedMembership.organizationId, userId: session.userId };
}

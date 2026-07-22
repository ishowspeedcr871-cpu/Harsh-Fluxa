import { cookies } from "next/headers";
import { getCurrentSession } from "@/services/auth/session";

export const ACTIVE_ORGANIZATION_COOKIE_NAME = "fluxa_active_organization";

export async function setActiveOrganizationId(organizationId: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_ORGANIZATION_COOKIE_NAME, organizationId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function clearActiveOrganizationId() {
  const cookieStore = await cookies();
  cookieStore.delete(ACTIVE_ORGANIZATION_COOKIE_NAME);
}

export async function getSelectedOrganizationId() {
  const cookieStore = await cookies();
  return cookieStore.get(ACTIVE_ORGANIZATION_COOKIE_NAME)?.value;
}

export async function getActiveOrganization() {
  const session = await getCurrentSession();
  if (!session) return null;

  const selectedOrganizationId = await getSelectedOrganizationId();
  const membership = selectedOrganizationId
    ? session.user.memberships.find((item) => item.organizationId === selectedOrganizationId)
    : null;

  const activeMembership = membership ?? session.user.memberships[0];
  return activeMembership?.organization ?? null;
}

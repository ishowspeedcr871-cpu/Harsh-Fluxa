import { redirect } from "next/navigation";
import { getCurrentSession } from "@/services/auth/session";
import { getActiveOrganizationMembership } from "@/services/organizations/organization-service";

export async function requireCustomerContext() {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/login?portal=customer&next=/customer");
  }


  // Verify the user actually has a customer membership
  const customerMembership = session.user.memberships.find(
    (m) => m.role.scope === "CUSTOMER"
  );

  if (!customerMembership || customerMembership.organization.status === "SUSPENDED" || customerMembership.organization.deletedAt !== null) {
    // If the user does not have an active customer role or organization is suspended/deleted, redirect them to the customer login!
    redirect("/login?portal=customer&next=/customer");
  }

  return { 
    session, 
    user: session.user,
    membership: customerMembership, 
    organization: customerMembership.organization 
  };
}

export async function getCustomerProfile() {
  const { user, membership, organization } = await requireCustomerContext();
  return { user, membership, organization };
}

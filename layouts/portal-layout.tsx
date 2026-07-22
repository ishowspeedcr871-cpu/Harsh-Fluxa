import { redirect } from "next/navigation";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { getActiveOrganizationMembership } from "@/services/organizations/organization-service";
import { getCurrentSession } from "@/services/auth/session";

export async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const membership = await getActiveOrganizationMembership();
  if (!membership) redirect("/onboarding/organization");

  if (membership.role.key === "customer") {
    redirect("/customer");
  }

  if (membership.role.key === "employee" || membership.role.key === "organization-employee") {
    redirect("/employee");
  }

  return <DashboardLayout role="admin">{children}</DashboardLayout>;
}

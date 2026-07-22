import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { PortalLayout } from "@/layouts/portal-layout";
import { requireOrganizationOrRedirect } from "@/services/organizations/actions";
import { getActiveOrganizationMembership } from "@/services/organizations/organization-service";

export default async function DashboardPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams;
  if (searchParams.error === "forbidden") {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-black text-red-500 mb-4">403 Forbidden</h1>
        <p className="text-muted-foreground mb-8">You do not have permission to access this page.</p>
        <Link href="/" className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors font-bold">
          Go Home
        </Link>
      </div>
    );
  }

  const { session, user } = await requireOrganizationOrRedirect();
  const membership = await getActiveOrganizationMembership();

  if (!membership) redirect("/onboarding/organization");

  if (membership.role.key === "customer") {
    redirect("/customer");
  }

  if (membership.role.scope === "ORGANIZATION") {
    redirect("/employee");
  }

  const organization = membership.organization;

  return (
    <PortalLayout>
      <section className="grid gap-6">
        <Card>
          <CardHeader>
            <StatusBadge status="online" label="Protected tenant" />
            <CardTitle className="mt-4 text-3xl">
              Welcome back{user.name ? `, ${user.name}` : ""}
            </CardTitle>
            <CardDescription>
              You are working in {organization.name}. All future print-domain data will be scoped to
              this tenant context.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/organization"
              className="focus-ring glass-surface inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-medium text-foreground transition hover:bg-white/10"
            >
              Open organization dashboard
            </Link>
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Active memberships" value={String(user.memberships.length)} />
          <MetricCard label="Active tenant" value={organization.slug} tone="magenta" />
          <MetricCard label="Tenant context" value="Ready" tone="success" />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Phase 5 organization foundation</CardTitle>
            <CardDescription>
              Organization management, settings, switching, and tenant-aware services are ready for
              future print-domain workflows.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Print jobs, printer inventory, file uploads, OTP release, analytics, and billing
              remain intentionally deferred.
            </p>
          </CardContent>
        </Card>
      </section>
    </PortalLayout>
  );
}

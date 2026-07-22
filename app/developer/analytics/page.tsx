import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { DeveloperPortalLayout } from "@/layouts/developer-portal-layout";
import { getPlatformAnalytics } from "@/services/analytics/analytics-service";
import { requireMasterDeveloper } from "@/services/developer/platform-authorization";
import { formatBytes } from "@/utils/format";

export default async function DeveloperAnalyticsPage() {
  await requireMasterDeveloper();
  const analytics = await getPlatformAnalytics();
  return (
    <DeveloperPortalLayout>
      <section className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-5">
          <MetricCard label="Organizations" value={String(analytics.organizations)} />
          <MetricCard label="Users" value={String(analytics.users)} tone="magenta" />
          <MetricCard label="Total jobs" value={String(analytics.totalJobs)} tone="success" />
          <MetricCard label="Storage" value={formatBytes(analytics.storageBytes)} />
          <MetricCard label="Active sessions" value={String(analytics.activeSessions)} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Platform analytics</CardTitle>
            <CardDescription>{analytics.systemHealth}</CardDescription>
          </CardHeader>
        </Card>
      </section>
    </DeveloperPortalLayout>
  );
}

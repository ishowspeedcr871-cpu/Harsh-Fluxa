import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, Td, Th } from "@/components/ui/table";
import { DeveloperPortalLayout } from "@/layouts/developer-portal-layout";
import { getSystemHealth } from "@/services/developer/platform-service";
import { MetricCard } from "@/components/ui/metric-card";
export default async function Page() {
  const h = await getSystemHealth();
  return (
    <DeveloperPortalLayout>
      <section className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard label="Active sessions" value={String(h.activeSessions)} />
          <MetricCard label="Stale OTPs" value={String(h.staleOtps)} tone="magenta" />
          <MetricCard label="Failed jobs" value={String(h.failedJobs)} />
          <MetricCard label="Critical audits" value={String(h.criticalAudits)} tone="magenta" />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Subsystem status</CardTitle>
            <CardDescription>
              Database: {h.database} · Queue: {h.queue} · Storage: {h.storage}
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    </DeveloperPortalLayout>
  );
}

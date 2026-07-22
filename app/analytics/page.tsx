import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { Table, Td, Th } from "@/components/ui/table";
import { PortalLayout } from "@/layouts/portal-layout";
import { getOrganizationAnalytics } from "@/services/analytics/analytics-service";

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const width = max > 0 ? Math.max(8, (value / max) * 100) : 8;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}</span>
      </div>
      <div className="h-3 rounded-full bg-white/10">
        <div
          className="h-3 rounded-full bg-gradient-to-r from-accent-cyan to-accent-magenta"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export default async function AnalyticsPage() {
  const analytics = await getOrganizationAnalytics();
  const maxStatus = Math.max(1, ...analytics.statusDistribution.map((item: any) => item.count));
  return (
    <PortalLayout>
      <section className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Daily volume" value={String(analytics.volume.daily)} />
          <MetricCard
            label="Weekly volume"
            value={String(analytics.volume.weekly)}
            tone="magenta"
          />
          <MetricCard
            label="Monthly volume"
            value={String(analytics.volume.monthly)}
            tone="success"
          />
          <MetricCard label="Revenue" value={`$${analytics.revenue.toFixed(2)}`} />
          <MetricCard label="Pending jobs" value={String(analytics.pending)} tone="magenta" />
          <MetricCard label="Completed jobs" value={String(analytics.completed)} tone="success" />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Job status distribution</CardTitle>
            <CardDescription>
              Tenant-scoped operational mix across the print lifecycle.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.statusDistribution.map((item: any) => (
              <Bar key={item.status} label={item.status} value={item.count} max={maxStatus} />
            ))}
          </CardContent>
        </Card>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Employee productivity</CardTitle>
              <CardDescription>Assigned job throughput by employee.</CardDescription>
            </CardHeader>
            <Table>
              <thead>
                <tr>
                  <Th>Employee</Th>
                  <Th>Jobs</Th>
                </tr>
              </thead>
              <tbody>
                {analytics.employeeProductivity.map((item: any) => (
                  <tr key={item.user?.id ?? "unassigned"}>
                    <Td>{item.user?.email ?? "Unknown employee"}</Td>
                    <Td>
                      <Badge tone="cyan">{item.jobs}</Badge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Printer utilization</CardTitle>
              <CardDescription>Jobs routed to each tenant printer.</CardDescription>
            </CardHeader>
            <Table>
              <thead>
                <tr>
                  <Th>Printer</Th>
                  <Th>Health</Th>
                  <Th>Jobs</Th>
                </tr>
              </thead>
              <tbody>
                {analytics.printerUtilization.map((item: any) => (
                  <tr key={item.printer?.id ?? "unknown"}>
                    <Td>{item.printer?.name ?? "Unknown printer"}</Td>
                    <Td>
                      {item.printer ? `${item.printer.status} · ${item.printer.health}` : "—"}
                    </Td>
                    <Td>
                      <Badge tone="magenta">{item.jobs}</Badge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </div>
      </section>
    </PortalLayout>
  );
}

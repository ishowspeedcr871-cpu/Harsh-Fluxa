import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { Table, Td, Th } from "@/components/ui/table";
import { DeveloperPortalLayout } from "@/layouts/developer-portal-layout";
import { getAiAnalyticsDashboard } from "@/services/intelligence/intelligence-service";

export const dynamic = "force-dynamic";

export default async function DeveloperIntelligencePage() {
  const dashboard = await getAiAnalyticsDashboard(null);
  return (
    <DeveloperPortalLayout>
      <section className="grid gap-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-accent-cyan">Phase 13C</p>
          <h1 className="text-3xl font-semibold">AI Operations Center</h1>
          <p className="text-muted-foreground">
            AI health, automation health, search metrics, recommendation statistics, OCR metrics,
            provider usage, error reports and system diagnostics.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard label="AI requests" value={String(dashboard.aiRequests.length)} />
          <MetricCard
            label="Failures"
            value={String(dashboard.metrics.aiRequestFailures)}
            tone="magenta"
          />
          <MetricCard label="Recommendations" value={String(dashboard.recommendations.length)} />
          <MetricCard
            label="Automation matches"
            value={String(dashboard.metrics.activeAutomations)}
          />
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recommendation statistics</CardTitle>
              <CardDescription>Acceptance and optimization signals across tenants.</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard.recommendations.length ? (
                <Table>
                  <thead>
                    <tr>
                      <Th>Tenant</Th>
                      <Th>Status</Th>
                      <Th>Paper</Th>
                      <Th>Color</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.recommendations.slice(0, 20).map((item) => (
                      <tr key={item.id}>
                        <Td>{item.organizationId}</Td>
                        <Td>{item.status}</Td>
                        <Td>{item.recommendedPaperSize ?? "—"}</Td>
                        <Td>{item.recommendedColor ? "Color" : "B/W"}</Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No recommendation statistics are available.
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Automation health</CardTitle>
              <CardDescription>Recent automation executions and match status.</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard.automations.length ? (
                <Table>
                  <thead>
                    <tr>
                      <Th>Rule</Th>
                      <Th>Status</Th>
                      <Th>Matched</Th>
                      <Th>Error</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.automations.slice(0, 20).map((item) => (
                      <tr key={item.id}>
                        <Td>{item.rule.name}</Td>
                        <Td>{item.status}</Td>
                        <Td>{item.matched ? "Yes" : "No"}</Td>
                        <Td>{item.errorCode ?? "—"}</Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No automation executions have been recorded.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Search and OCR intelligence</CardTitle>
            <CardDescription>
              Search metrics, OCR performance and system diagnostics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard label="Recent searches" value={String(dashboard.recentSearches.length)} />
              <MetricCard
                label="OCR completion"
                value={`${Math.round(dashboard.metrics.ocrCompletionRate * 100)}%`}
              />
              <MetricCard
                label="Acceptance"
                value={`${Math.round(dashboard.metrics.recommendationAcceptanceRate * 100)}%`}
              />
            </div>
          </CardContent>
        </Card>
      </section>
    </DeveloperPortalLayout>
  );
}

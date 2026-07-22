import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { Table, Td, Th } from "@/components/ui/table";
import { DeveloperPortalLayout } from "@/layouts/developer-portal-layout";
import { getPlatformAiDashboard } from "@/services/ai/ai-service";

export const dynamic = "force-dynamic";

function formatDate(value?: Date | null) {
  return value
    ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(value)
    : "Never";
}

export default async function DeveloperAiPage() {
  const dashboard = await getPlatformAiDashboard();
  const failed = dashboard.errors.length;
  const totalRequests = dashboard.requests.length;
  const totalModels = dashboard.providers.reduce(
    (sum, provider) => sum + provider.models.length,
    0,
  );

  return (
    <DeveloperPortalLayout>
      <section className="grid gap-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-accent-cyan">Phase 13A</p>
          <h1 className="text-3xl font-semibold">AI management</h1>
          <p className="text-muted-foreground">
            Platform-wide AI provider status, health, usage, diagnostics and request/error logs.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard label="Providers" value={String(dashboard.providers.length)} />
          <MetricCard label="Models" value={String(totalModels)} />
          <MetricCard label="Recent requests" value={String(totalRequests)} />
          <MetricCard label="Recent errors" value={String(failed)} tone="magenta" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Provider status</CardTitle>
            <CardDescription>
              Global and tenant providers registered through the provider registry.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboard.providers.length ? (
              <Table>
                <thead>
                  <tr>
                    <Th>Provider</Th>
                    <Th>Scope</Th>
                    <Th>Status</Th>
                    <Th>Models</Th>
                    <Th>Latest health</Th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.providers.map((provider) => (
                    <tr key={provider.id}>
                      <Td>{provider.name}</Td>
                      <Td>{provider.organizationId ? "Tenant" : "Platform"}</Td>
                      <Td>
                        <Badge>{provider.status}</Badge>
                      </Td>
                      <Td>{provider.models.length}</Td>
                      <Td>{provider.healthChecks[0]?.status ?? "UNKNOWN"}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">
                No AI providers have been registered yet.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Request logs</CardTitle>
              <CardDescription>
                Recent platform AI request metadata with tenant isolation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard.requests.length ? (
                <Table>
                  <thead>
                    <tr>
                      <Th>Tenant</Th>
                      <Th>Feature</Th>
                      <Th>Status</Th>
                      <Th>Provider</Th>
                      <Th>Created</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.requests.map((request) => (
                      <tr key={request.id}>
                        <Td>{request.organization.name}</Td>
                        <Td>{request.featureKey}</Td>
                        <Td>{request.status}</Td>
                        <Td>{request.provider?.name ?? "Unassigned"}</Td>
                        <Td>{formatDate(request.createdAt)}</Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No AI request logs are available.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Error logs</CardTitle>
              <CardDescription>Failed and timed-out AI request diagnostics.</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard.errors.length ? (
                <Table>
                  <thead>
                    <tr>
                      <Th>Tenant</Th>
                      <Th>Code</Th>
                      <Th>Message</Th>
                      <Th>Created</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.errors.map((request) => (
                      <tr key={request.id}>
                        <Td>{request.organization.name}</Td>
                        <Td>{request.errorCode ?? "AI_ERROR"}</Td>
                        <Td>{request.errorMessage ?? "Request did not complete."}</Td>
                        <Td>{formatDate(request.createdAt)}</Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No AI request errors are available.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Usage statistics</CardTitle>
              <CardDescription>
                Daily usage counters for future cost and quota controls.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard.usage.length ? (
                <Table>
                  <thead>
                    <tr>
                      <Th>Tenant</Th>
                      <Th>Feature</Th>
                      <Th>Requests</Th>
                      <Th>Tokens</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.usage.map((usage) => (
                      <tr key={usage.id}>
                        <Td>{usage.organization?.name ?? "Platform"}</Td>
                        <Td>{usage.featureKey}</Td>
                        <Td>{usage.requestCount}</Td>
                        <Td>{usage.totalTokens}</Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No AI usage has been aggregated yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Provider health</CardTitle>
              <CardDescription>
                Health check history and diagnostics for registered providers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard.health.length ? (
                <Table>
                  <thead>
                    <tr>
                      <Th>Provider</Th>
                      <Th>Status</Th>
                      <Th>Latency</Th>
                      <Th>Checked</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.health.map((health) => (
                      <tr key={health.id}>
                        <Td>{health.provider.name}</Td>
                        <Td>{health.status}</Td>
                        <Td>{health.latencyMs ? `${health.latencyMs}ms` : "—"}</Td>
                        <Td>{formatDate(health.checkedAt)}</Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No provider health checks have been recorded yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </DeveloperPortalLayout>
  );
}

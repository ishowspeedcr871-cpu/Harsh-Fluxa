import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { Table, Td, Th } from "@/components/ui/table";
import { DeveloperPortalLayout } from "@/layouts/developer-portal-layout";
import { getPlatformOcrDashboard } from "@/services/ocr/ocr-service";

export const dynamic = "force-dynamic";

function formatDate(value?: Date | null) {
  return value
    ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(value)
    : "Never";
}

export default async function DeveloperOcrPage() {
  const dashboard = await getPlatformOcrDashboard();
  const active = dashboard.jobs.filter((job) =>
    ["QUEUED", "PROCESSING", "RETRYING"].includes(job.status),
  ).length;
  const completed = dashboard.jobs.filter((job) => job.status === "COMPLETED").length;
  const pages = dashboard.analytics.reduce((sum, item) => sum + item.pageCount, 0);

  return (
    <DeveloperPortalLayout>
      <section className="grid gap-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-accent-cyan">Phase 13B</p>
          <h1 className="text-3xl font-semibold">OCR management</h1>
          <p className="text-muted-foreground">
            Platform OCR health, queue status, logs, errors, usage metrics and diagnostics.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard label="Active queue" value={String(active)} />
          <MetricCard label="Completed" value={String(completed)} />
          <MetricCard label="Errors" value={String(dashboard.errors.length)} tone="magenta" />
          <MetricCard label="Analyzed pages" value={String(pages)} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Queue status and job logs</CardTitle>
            <CardDescription>Recent OCR jobs across all tenants.</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboard.jobs.length ? (
              <Table>
                <thead>
                  <tr>
                    <Th>Tenant</Th>
                    <Th>File</Th>
                    <Th>Status</Th>
                    <Th>Attempts</Th>
                    <Th>Queued</Th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.jobs.map((job) => (
                    <tr key={job.id}>
                      <Td>{job.organization.name}</Td>
                      <Td>{job.printJobFile?.fileName ?? "Detached file"}</Td>
                      <Td>
                        <Badge>{job.status}</Badge>
                      </Td>
                      <Td>
                        {job.attemptCount}/{job.maxAttempts}
                      </Td>
                      <Td>{formatDate(job.queuedAt)}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">
                No OCR jobs have been queued across the platform.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Error reports</CardTitle>
              <CardDescription>Failed OCR jobs and recoverable source errors.</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard.errors.length ? (
                <Table>
                  <thead>
                    <tr>
                      <Th>Tenant</Th>
                      <Th>File</Th>
                      <Th>Code</Th>
                      <Th>Updated</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.errors.map((job) => (
                      <tr key={job.id}>
                        <Td>{job.organization.name}</Td>
                        <Td>{job.printJobFile?.fileName ?? "Detached file"}</Td>
                        <Td>{job.errorCode ?? "OCR_ERROR"}</Td>
                        <Td>{formatDate(job.updatedAt)}</Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No OCR error reports are available.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage metrics</CardTitle>
              <CardDescription>Daily OCR job, page and file-volume counters.</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard.analytics.length ? (
                <Table>
                  <thead>
                    <tr>
                      <Th>Tenant</Th>
                      <Th>Jobs</Th>
                      <Th>Completed</Th>
                      <Th>Failed</Th>
                      <Th>Pages</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.analytics.map((item) => (
                      <tr key={item.id}>
                        <Td>{item.organization?.name ?? "Platform"}</Td>
                        <Td>{item.jobCount}</Td>
                        <Td>{item.completedCount}</Td>
                        <Td>{item.failedCount}</Td>
                        <Td>{item.pageCount}</Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No OCR usage metrics have been aggregated yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Document intelligence diagnostics</CardTitle>
            <CardDescription>Recent structured analysis reports across tenants.</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboard.analyses.length ? (
              <Table>
                <thead>
                  <tr>
                    <Th>Tenant</Th>
                    <Th>File</Th>
                    <Th>Health</Th>
                    <Th>Quality</Th>
                    <Th>Created</Th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.analyses.map((analysis) => (
                    <tr key={analysis.id}>
                      <Td>{analysis.organization.name}</Td>
                      <Td>{analysis.printJobFile?.fileName ?? "Detached file"}</Td>
                      <Td>{analysis.fileHealth}</Td>
                      <Td>{analysis.imageQuality}</Td>
                      <Td>{formatDate(analysis.createdAt)}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">
                No document intelligence diagnostics are available.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </DeveloperPortalLayout>
  );
}

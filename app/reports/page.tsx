import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MetricCard } from "@/components/ui/metric-card";
import { Select } from "@/components/ui/select";
import { Table, Td, Th } from "@/components/ui/table";
import { printJobStatusValues } from "@/features/print-jobs/schemas";
import { reportQuerySchema } from "@/features/reports/schemas";
import { PortalLayout } from "@/layouts/portal-layout";
import { generateOrganizationJobReport } from "@/services/reports/report-service";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = reportQuerySchema.parse(await searchParams);
  const report = await generateOrganizationJobReport(query);
  return (
    <PortalLayout>
      <section className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Report jobs" value={String(report.summary.jobs)} />
          <MetricCard
            label="Report revenue"
            value={`$${report.summary.revenue.toFixed(2)}`}
            tone="success"
          />
          <MetricCard
            label="Export"
            value={report.exportFoundation?.format.toUpperCase() ?? "Ready"}
            tone="magenta"
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Print job reports</CardTitle>
            <CardDescription>
              Date range, status, search, sorting, pagination, and export foundation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3 md:grid-cols-8">
              <Input name="q" placeholder="Search jobs/customers" defaultValue={query.q} />
              <Input name="dateFrom" type="date" defaultValue={query.dateFrom} />
              <Input name="dateTo" type="date" defaultValue={query.dateTo} />
              <Select name="status" defaultValue={query.status}>
                <option value="all">All statuses</option>
                {printJobStatusValues.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
              <Select name="sort" defaultValue={query.sort}>
                <option value="createdAt">Created</option>
                <option value="title">Title</option>
                <option value="status">Status</option>
                <option value="priority">Priority</option>
                <option value="estimatedCost">Revenue</option>
              </Select>
              <Select name="direction" defaultValue={query.direction}>
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </Select>
              <Select name="exportFormat" defaultValue={query.exportFormat ?? undefined}>
                <option value="">Interactive</option>
                <option value="csv">CSV</option>
                <option value="excel">Excel</option>
                <option value="pdf">PDF foundation</option>
              </Select>
              <Button type="submit">Generate</Button>
            </form>
            {report.exportFoundation ? (
              <p className="mt-3 text-sm text-muted-foreground">
                {report.exportFoundation.message}
              </p>
            ) : null}
          </CardContent>
        </Card>
        <Table>
          <thead>
            <tr>
              <Th>Job</Th>
              <Th>Customer</Th>
              <Th>Status</Th>
              <Th>Priority</Th>
              <Th>Printer</Th>
              <Th>Revenue</Th>
              <Th>Created</Th>
            </tr>
          </thead>
          <tbody>
            {report.jobs.map((job) => (
              <tr key={job.id}>
                <Td>{job.title}</Td>
                <Td>{job.customerUser.email}</Td>
                <Td>{job.status}</Td>
                <Td>{job.priority}</Td>
                <Td>{job.printer?.name ?? "—"}</Td>
                <Td>${Number(job.estimatedCost ?? 0).toFixed(2)}</Td>
                <Td>{job.createdAt.toLocaleString()}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
        <p className="text-sm text-muted-foreground">
          {report.total} rows · page {report.page} of {report.pageCount}
        </p>
      </section>
    </PortalLayout>
  );
}

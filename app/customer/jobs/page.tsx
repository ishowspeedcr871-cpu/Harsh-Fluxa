import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, Td, Th } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CustomerPortalLayout } from "@/layouts/customer-portal-layout";
import { printJobQuerySchema, printJobStatusValues } from "@/features/print-jobs/schemas";
import { listCustomerPrintJobs } from "@/services/print-jobs/print-job-service";

export default async function CustomerJobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = printJobQuerySchema.parse(await searchParams);
  const { jobs, total, page, pageCount } = await listCustomerPrintJobs(query);
  return (
    <CustomerPortalLayout>
      <section className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Print history</CardTitle>
            <CardDescription>
              Search, filter, and page through your tenant-scoped print jobs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3 md:grid-cols-4">
              <Input name="q" placeholder="Search jobs" defaultValue={query.q} />
              <Select name="status" defaultValue={query.status}>
                <option value="all">All statuses</option>
                {printJobStatusValues.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
              <Input name="pageSize" type="number" min={5} max={50} defaultValue={query.pageSize} />
              <Button type="submit">Apply</Button>
            </form>
          </CardContent>
        </Card>
        <Table>
          <thead>
            <tr>
              <Th>Job</Th>
              <Th>Status</Th>
              <Th>Files</Th>
              <Th>Created</Th>
              <Th>Details</Th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <Td>{job.title}</Td>
                <Td>{job.status}</Td>
                <Td>{job.files.length}</Td>
                <Td>{job.createdAt.toLocaleDateString()}</Td>
                <Td>
                  <Link
                    href={`/customer/jobs/${job.id}`}
                    className="text-accent-cyan hover:underline"
                  >
                    Open
                  </Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
        <p className="text-sm text-muted-foreground">
          {total} jobs · page {page} of {pageCount}
        </p>
      </section>
    </CustomerPortalLayout>
  );
}

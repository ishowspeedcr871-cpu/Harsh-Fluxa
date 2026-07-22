import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { DeveloperPortalLayout } from "@/layouts/developer-portal-layout";
import { getFoundationRecords } from "@/services/developer/platform-service";

export default async function DeveloperErrorsPage() {
  const { failedJobs, warningAudits } = await getFoundationRecords();
  return (
    <DeveloperPortalLayout>
      <section className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Error monitoring</CardTitle>
            <CardDescription>
              Failed jobs and warning/critical audit events form the monitoring foundation.
            </CardDescription>
          </CardHeader>
        </Card>
        <Table>
          <thead>
            <tr>
              <Th>Type</Th>
              <Th>Organization</Th>
              <Th>Details</Th>
              <Th>Updated</Th>
            </tr>
          </thead>
          <tbody>
            {failedJobs.map((j) => (
              <tr key={j.id}>
                <Td>FAILED_JOB</Td>
                <Td>{j.organization.name}</Td>
                <Td>{j.title}</Td>
                <Td>{j.updatedAt.toLocaleString()}</Td>
              </tr>
            ))}
            {warningAudits.map((a) => (
              <tr key={a.id}>
                <Td>{a.severity}</Td>
                <Td>{a.organization?.name ?? "Platform"}</Td>
                <Td>{a.action}</Td>
                <Td>{a.createdAt.toLocaleString()}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>
    </DeveloperPortalLayout>
  );
}

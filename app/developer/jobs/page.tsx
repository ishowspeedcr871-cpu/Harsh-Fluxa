import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { DeveloperPortalLayout } from "@/layouts/developer-portal-layout";
import { getSystemHealth } from "@/services/developer/platform-service";

export default async function DeveloperJobsPage() {
  const health = await getSystemHealth();
  const jobs = [
    ["otp-expiration-sweeper", "foundation", `${health.staleOtps} stale OTPs detected`],
    ["report-export-worker", "planned", "CSV/Excel/PDF background generation foundation"],
    ["storage-cleanup-worker", "planned", "Orphaned upload cleanup foundation"],
    ["notification-dispatcher", "foundation", "In-app notification dispatch is active"],
  ];
  return (
    <DeveloperPortalLayout>
      <section className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Background job monitoring</CardTitle>
            <CardDescription>
              Operational worker registry and queue-health foundation.
            </CardDescription>
          </CardHeader>
        </Card>
        <Table>
          <thead>
            <tr>
              <Th>Job</Th>
              <Th>Status</Th>
              <Th>Signal</Th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(([name, status, signal]) => (
              <tr key={name}>
                <Td>{name}</Td>
                <Td>{status}</Td>
                <Td>{signal}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>
    </DeveloperPortalLayout>
  );
}

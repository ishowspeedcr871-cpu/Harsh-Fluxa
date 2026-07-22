import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { DeveloperPortalLayout } from "@/layouts/developer-portal-layout";
import { listPlatformOrganizations } from "@/services/developer/platform-service";

export default async function DeveloperSubscriptionsPage() {
  const data = await listPlatformOrganizations({ page: 1, pageSize: 20, q: "", status: "all" });
  return (
    <DeveloperPortalLayout>
      <section className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Subscription management</CardTitle>
            <CardDescription>
              Subscription foundation mapped to organizations pending billing-provider integration.
            </CardDescription>
          </CardHeader>
        </Card>
        <Table>
          <thead>
            <tr>
              <Th>Organization</Th>
              <Th>Plan</Th>
              <Th>Status</Th>
              <Th>Billing foundation</Th>
            </tr>
          </thead>
          <tbody>
            {data.organizations.map((o) => (
              <tr key={o.id}>
                <Td>{o.name}</Td>
                <Td>Enterprise</Td>
                <Td>{o.status}</Td>
                <Td>Ready for provider mapping</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>
    </DeveloperPortalLayout>
  );
}

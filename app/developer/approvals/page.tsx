import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, Td, Th } from "@/components/ui/table";
import { DeveloperPortalLayout } from "@/layouts/developer-portal-layout";
import { listOrganizationApprovals } from "@/services/developer/platform-service";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const data = await listOrganizationApprovals(await searchParams);
  return (
    <DeveloperPortalLayout>
      <section className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Organization approvals</CardTitle>
            <CardDescription>
              Approval workflow foundation using tenant status and audit history.
            </CardDescription>
          </CardHeader>
        </Card>
        <Table>
          <thead>
            <tr>
              <Th>Organization</Th>
              <Th>Status</Th>
              <Th>Created</Th>
              <Th>Members</Th>
            </tr>
          </thead>
          <tbody>
            {data.organizations.map((o) => (
              <tr key={o.id}>
                <Td>{o.name}</Td>
                <Td>{o.status}</Td>
                <Td>{o.createdAt.toLocaleString()}</Td>
                <Td>{o._count.memberships}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>
    </DeveloperPortalLayout>
  );
}

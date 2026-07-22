import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, Td, Th } from "@/components/ui/table";
import { DeveloperPortalLayout } from "@/layouts/developer-portal-layout";
import { listPlatformAuditLogs } from "@/services/developer/platform-service";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const data = await listPlatformAuditLogs(await searchParams);
  return (
    <DeveloperPortalLayout>
      <section className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform audit logs</CardTitle>
            <CardDescription>Cross-tenant audit review for platform operations.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex gap-3">
              <Input name="q" placeholder="Search actions" />
              <Button type="submit">Search</Button>
            </form>
          </CardContent>
        </Card>
        <Table>
          <thead>
            <tr>
              <Th>Action</Th>
              <Th>Severity</Th>
              <Th>Actor</Th>
              <Th>Organization</Th>
              <Th>Created</Th>
            </tr>
          </thead>
          <tbody>
            {data.logs.map((l) => (
              <tr key={l.id}>
                <Td>{l.action}</Td>
                <Td>{l.severity}</Td>
                <Td>{l.actorUser?.email ?? "System"}</Td>
                <Td>{l.organization?.name ?? "Platform"}</Td>
                <Td>{l.createdAt.toLocaleString()}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>
    </DeveloperPortalLayout>
  );
}

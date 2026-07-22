import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, Td, Th } from "@/components/ui/table";
import { DeveloperPortalLayout } from "@/layouts/developer-portal-layout";
import { listPlatformUsers } from "@/services/developer/platform-service";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const data = await listPlatformUsers(await searchParams, "CUSTOMER");
  return (
    <DeveloperPortalLayout>
      <section className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Global customers</CardTitle>
            <CardDescription>Customer accounts across all organizations.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex gap-3">
              <Input name="q" placeholder="Search email or name" />
              <Button type="submit">Search</Button>
            </form>
          </CardContent>
        </Card>
        <Table>
          <thead>
            <tr>
              <Th>User</Th>
              <Th>Status</Th>
              <Th>Memberships</Th>
              <Th>Customer jobs</Th>
              <Th>Assigned jobs</Th>
            </tr>
          </thead>
          <tbody>
            {data.users.map((user) => (
              <tr key={user.id}>
                <Td>
                  {user.email}
                  <br />
                  <span className="text-xs text-muted-foreground">
                    {user.name ?? "No display name"}
                  </span>
                </Td>
                <Td>
                  <Badge tone={user.status === "ACTIVE" ? "success" : "magenta"}>
                    {user.status}
                  </Badge>
                </Td>
                <Td>
                  {user.memberships
                    .map((m) => `${m.organization.name} · ${m.role.name}`)
                    .join(", ") || "—"}
                </Td>
                <Td>{user._count.customerPrintJobs}</Td>
                <Td>{user._count.assignedPrintJobs}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
        <p className="text-sm text-muted-foreground">
          {data.total} records · page {data.page} of {data.pageCount}
        </p>
      </section>
    </DeveloperPortalLayout>
  );
}

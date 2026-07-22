import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, Td, Th } from "@/components/ui/table";
import { DeveloperPortalLayout } from "@/layouts/developer-portal-layout";
import { 
  listPlatformUsers,
  setUserStatusAction,
  deleteUserAction,
} from "@/services/developer/platform-service";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const data = await listPlatformUsers(await searchParams, undefined);
  return (
    <DeveloperPortalLayout>
      <section className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform-wide users</CardTitle>
            <CardDescription>
              Search every account across all tenants and platform roles. Manage login statuses (Pause/Resume) or Delete users immediately.
            </CardDescription>
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
              <Th>Actions</Th>
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
                <Td>
                  <div className="flex gap-2">
                    {user.status === "ACTIVE" ? (
                      <form action={setUserStatusAction}>
                        <input type="hidden" name="userId" value={user.id} />
                        <input type="hidden" name="status" value="SUSPENDED" />
                        <Button size="sm" variant="secondary" type="submit">
                          Pause
                        </Button>
                      </form>
                    ) : (
                      <form action={setUserStatusAction}>
                        <input type="hidden" name="userId" value={user.id} />
                        <input type="hidden" name="status" value="ACTIVE" />
                        <Button size="sm" variant="success" type="submit">
                          Resume
                        </Button>
                      </form>
                    )}
                    <form action={deleteUserAction}>
                      <input type="hidden" name="userId" value={user.id} />
                      <Button size="sm" variant="danger" type="submit">
                        Delete
                      </Button>
                    </form>
                  </div>
                </Td>
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

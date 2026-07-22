import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { DeveloperPortalLayout } from "@/layouts/developer-portal-layout";
import {
  impersonateOrganizationAction,
  listPlatformOrganizations,
  setOrganizationStatusAction,
  deleteOrganizationAction,
} from "@/services/developer/platform-service";

export default async function DeveloperOrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const data = await listPlatformOrganizations(await searchParams);
  return (
    <DeveloperPortalLayout>
      <section className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Global organizations</CardTitle>
            <CardDescription>
              View, suspend, restore, archive, and impersonate tenants with audit logging.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3 md:grid-cols-4">
              <Input name="q" placeholder="Search organizations" />
              <Select name="status" defaultValue="all">
                <option value="all">All</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="ARCHIVED">Archived</option>
              </Select>
              <Button type="submit">Filter</Button>
            </form>
          </CardContent>
        </Card>
        <Table>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Status</Th>
              <Th>Members</Th>
              <Th>Jobs</Th>
              <Th>Printers</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.organizations.map((org) => (
              <tr key={org.id}>
                <Td>
                  {org.name}
                  <br />
                  <span className="text-xs text-muted-foreground">{org.slug}</span>
                </Td>
                <Td>
                  <Badge tone={org.status === "ACTIVE" ? "success" : "magenta"}>{org.status}</Badge>
                </Td>
                <Td>{org._count.memberships}</Td>
                <Td>{org._count.printJobs}</Td>
                <Td>{org._count.printers}</Td>
                <Td>
                  <div className="flex flex-wrap gap-2">
                    <form action={impersonateOrganizationAction}>
                      <input type="hidden" name="organizationId" value={org.id} />
                      <Button size="sm" variant="secondary" type="submit">
                        Impersonate
                      </Button>
                    </form>
                    {["ACTIVE", "SUSPENDED", "ARCHIVED"].map((status) => (
                      <form key={status} action={setOrganizationStatusAction}>
                        <input type="hidden" name="organizationId" value={org.id} />
                        <input type="hidden" name="status" value={status} />
                        <Button
                          size="sm"
                          variant={status === "SUSPENDED" ? "danger" : "ghost"}
                          type="submit"
                        >
                          {status}
                        </Button>
                      </form>
                    ))}
                    <form action={deleteOrganizationAction}>
                      <input type="hidden" name="organizationId" value={org.id} />
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
          {data.total} organizations · page {data.page} of {data.pageCount}
        </p>
      </section>
    </DeveloperPortalLayout>
  );
}

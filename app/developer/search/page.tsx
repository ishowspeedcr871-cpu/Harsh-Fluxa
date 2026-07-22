import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, Td, Th } from "@/components/ui/table";
import { DeveloperPortalLayout } from "@/layouts/developer-portal-layout";
import { globalSearch } from "@/services/developer/platform-service";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const data = await globalSearch(params);
  return (
    <DeveloperPortalLayout>
      <section className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Global search</CardTitle>
            <CardDescription>
              Search organizations, users, and print jobs across the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex gap-3">
              <Input name="q" placeholder="Search globally" defaultValue={params.q} />
              <Button type="submit">Search</Button>
            </form>
          </CardContent>
        </Card>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Organizations</CardTitle>
            </CardHeader>
            <CardContent>
              {data.organizations.map((o) => (
                <p key={o.id}>{o.name}</p>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
            </CardHeader>
            <CardContent>
              {data.users.map((u) => (
                <p key={u.id}>{u.email}</p>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              {data.jobs.map((j) => (
                <p key={j.id}>
                  {j.title} · {j.organization.name}
                </p>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </DeveloperPortalLayout>
  );
}

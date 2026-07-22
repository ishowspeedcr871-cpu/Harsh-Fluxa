import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, Td, Th } from "@/components/ui/table";
import { DeveloperPortalLayout } from "@/layouts/developer-portal-layout";
import { listPlatformModules } from "@/services/developer/platform-service";
export default async function Page() {
  const modules = await listPlatformModules();
  return (
    <DeveloperPortalLayout>
      <section className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Global feature flags</CardTitle>
            <CardDescription>
              Platform module registry and tenant enablement foundation.
            </CardDescription>
          </CardHeader>
        </Card>
        <Table>
          <thead>
            <tr>
              <Th>Key</Th>
              <Th>Name</Th>
              <Th>Core</Th>
              <Th>Default</Th>
              <Th>Tenants</Th>
            </tr>
          </thead>
          <tbody>
            {modules.map((m) => (
              <tr key={m.id}>
                <Td>{m.key}</Td>
                <Td>{m.name}</Td>
                <Td>{m.isCore ? "Yes" : "No"}</Td>
                <Td>{m.isEnabledByDefault ? "Enabled" : "Disabled"}</Td>
                <Td>{m._count.organizationModules}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>
    </DeveloperPortalLayout>
  );
}

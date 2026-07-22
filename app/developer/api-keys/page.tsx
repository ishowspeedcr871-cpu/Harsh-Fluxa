import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, Td, Th } from "@/components/ui/table";
import { DeveloperPortalLayout } from "@/layouts/developer-portal-layout";
import {
  createApiKeyFoundationAction,
  getGlobalSettings,
} from "@/services/developer/platform-service";

export default async function DeveloperApiKeysPage() {
  const settings = (await getGlobalSettings()).filter((setting) =>
    setting.key.startsWith("api_key_foundation."),
  );
  return (
    <DeveloperPortalLayout>
      <section className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>API key management</CardTitle>
            <CardDescription>
              Foundation for scoped platform API credentials without exposing raw secrets.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              action={createApiKeyFoundationAction}
              className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"
            >
              <Input name="name" placeholder="Integration name" required />
              <Input name="scope" placeholder="platform.read" required />
              <Button type="submit">Create foundation</Button>
            </form>
          </CardContent>
        </Card>
        <Table>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Metadata</Th>
              <Th>Updated</Th>
            </tr>
          </thead>
          <tbody>
            {settings.map((s) => (
              <tr key={s.id}>
                <Td>{s.key.replace("api_key_foundation.", "")}</Td>
                <Td>{JSON.stringify(s.value)}</Td>
                <Td>{s.updatedAt.toLocaleString()}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>
    </DeveloperPortalLayout>
  );
}

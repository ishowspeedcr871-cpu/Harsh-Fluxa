import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, Td, Th } from "@/components/ui/table";
import { DeveloperPortalLayout } from "@/layouts/developer-portal-layout";
import {
  createPlatformAnnouncementAction,
  listAnnouncements,
} from "@/services/developer/platform-service";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const data = await listAnnouncements(await searchParams);
  return (
    <DeveloperPortalLayout>
      <section className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform announcements</CardTitle>
            <CardDescription>Create global in-app announcements.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createPlatformAnnouncementAction} className="grid gap-3">
              <Input name="title" placeholder="Announcement title" required />
              <Input name="message" placeholder="Message" required />
              <Select name="audience" defaultValue="PLATFORM">
                <option value="PLATFORM">Platform</option>
                <option value="ORGANIZATION">Organizations</option>
                <option value="USER">Users</option>
              </Select>
              <Button type="submit">Publish</Button>
            </form>
          </CardContent>
        </Card>
        <Table>
          <thead>
            <tr>
              <Th>Title</Th>
              <Th>Audience</Th>
              <Th>Status</Th>
              <Th>Created</Th>
            </tr>
          </thead>
          <tbody>
            {data.notifications.map((n) => (
              <tr key={n.id}>
                <Td>{n.title}</Td>
                <Td>{n.audience}</Td>
                <Td>{n.status}</Td>
                <Td>{n.createdAt.toLocaleString()}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>
    </DeveloperPortalLayout>
  );
}

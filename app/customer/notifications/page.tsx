import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, Td, Th } from "@/components/ui/table";
import { notificationQuerySchema } from "@/features/notifications/schemas";
import { CustomerPortalLayout } from "@/layouts/customer-portal-layout";
import {
  listNotifications,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/services/notifications/notification-service";

const notificationTypes = [
  "all",
  "NEW_JOB",
  "JOB_ASSIGNED",
  "JOB_STATUS_UPDATED",
  "OTP_GENERATED",
  "JOB_COLLECTED",
  "INVITATION_EVENT",
  "ORGANIZATION_EVENT",
  "SYSTEM_ANNOUNCEMENT",
];

export default async function CustomerNotificationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = notificationQuerySchema.parse(await searchParams);
  const { notifications, total, unread, page, pageCount } = await listNotifications(query);
  return (
    <CustomerPortalLayout>
      <section className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              Notification center <Badge tone={unread ? "magenta" : "muted"}>{unread} unread</Badge>
            </CardTitle>
            <CardDescription>
              In-app notification history for job, OTP, invitation, organization, and system events.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="grid gap-3 md:grid-cols-5">
              <Input name="q" placeholder="Search notifications" defaultValue={query.q} />
              <Select name="status" defaultValue={query.status}>
                <option value="all">All states</option>
                <option value="UNREAD">Unread</option>
                <option value="READ">Read</option>
                <option value="ARCHIVED">Archived</option>
              </Select>
              <Select name="type" defaultValue={query.type}>
                {notificationTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
              <Input name="pageSize" type="number" min={5} max={50} defaultValue={query.pageSize} />
              <Button type="submit">Apply</Button>
            </form>
            <form action={markAllNotificationsReadAction}>
              <Button type="submit" variant="secondary" size="sm">
                Mark all read
              </Button>
            </form>
          </CardContent>
        </Card>
        <Table>
          <thead>
            <tr>
              <Th>Type</Th>
              <Th>Title</Th>
              <Th>Message</Th>
              <Th>Status</Th>
              <Th>Entity</Th>
              <Th>Created</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((notification) => (
              <tr key={notification.id}>
                <Td>{notification.type}</Td>
                <Td>{notification.title}</Td>
                <Td>{notification.message}</Td>
                <Td>
                  <Badge tone={notification.status === "UNREAD" ? "magenta" : "muted"}>
                    {notification.status}
                  </Badge>
                </Td>
                <Td>
                  {notification.entityType === "PrintJob" && notification.entityId ? (
                    <Link
                      className="text-accent-cyan hover:underline"
                      href={`/customer/jobs/${notification.entityId}`}
                    >
                      Print job
                    </Link>
                  ) : (
                    (notification.entityType ?? "—")
                  )}
                </Td>
                <Td>{notification.createdAt.toLocaleString()}</Td>
                <Td>
                  {notification.status === "UNREAD" ? (
                    <form action={markNotificationReadAction}>
                      <input type="hidden" name="notificationId" value={notification.id} />
                      <Button type="submit" size="sm" variant="secondary">
                        Read
                      </Button>
                    </form>
                  ) : (
                    "—"
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
        <p className="text-sm text-muted-foreground">
          {total} notifications · page {page} of {pageCount}
        </p>
      </section>
    </CustomerPortalLayout>
  );
}

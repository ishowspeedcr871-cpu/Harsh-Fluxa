import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { PortalLayout } from "@/layouts/portal-layout";
import { getOrganizationMember } from "@/services/organizations/members";
import { listOrganizationRoles } from "@/services/organizations/roles";
import { restoreMembershipAction, updateMembershipAction } from "@/services/organizations/actions";

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ membershipId: string }>;
}) {
  const { membershipId } = await params;
  const [member, roles] = await Promise.all([
    getOrganizationMember(membershipId),
    listOrganizationRoles(),
  ]);
  if (!member) notFound();
  return (
    <PortalLayout>
      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <StatusBadge
              status={member.status === "ACTIVE" ? "online" : "offline"}
              label={member.status.toLowerCase()}
            />
            <CardTitle className="mt-4">{member.user.name ?? member.user.email}</CardTitle>
            <CardDescription>{member.user.email}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Role: {member.role.name}
            <br />
            Joined: {member.createdAt.toLocaleString()}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Membership management</CardTitle>
            <CardDescription>
              Update role, archive membership, restore membership, or remove access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateMembershipAction} className="space-y-4">
              <input type="hidden" name="membershipId" value={member.id} />
              <Select name="roleId" defaultValue={member.roleId}>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </Select>
              <Select
                name="status"
                defaultValue={member.status === "REMOVED" ? "REMOVED" : member.status}
              >
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="REMOVED">Removed</option>
              </Select>
              <Button type="submit">Save membership</Button>
            </form>
            {member.status === "REMOVED" ? (
              <form action={restoreMembershipAction} className="mt-4">
                <input type="hidden" name="membershipId" value={member.id} />
                <Button type="submit" variant="success">
                  Restore membership
                </Button>
              </form>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </PortalLayout>
  );
}

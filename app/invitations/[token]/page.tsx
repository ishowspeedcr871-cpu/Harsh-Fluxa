import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthLayout } from "@/layouts/auth-layout";
import { getCurrentSession } from "@/services/auth/session";
import { acceptInvitationAction } from "@/services/organizations/actions";
import { getInvitationByToken } from "@/services/organizations/invitations";

export default async function InvitationAcceptPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const [session, invitation] = await Promise.all([
    getCurrentSession(),
    getInvitationByToken(token),
  ]);
  if (!session) redirect(`/login?next=/invitations/${token}`);
  return (
    <AuthLayout>
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Organization invitation</CardTitle>
          <CardDescription>
            {invitation
              ? `Join ${invitation.organization.name} as ${invitation.role.name}.`
              : "This invitation could not be found."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invitation?.status === "PENDING" ? (
            <form action={acceptInvitationAction} className="space-y-4">
              <input type="hidden" name="token" value={token} />
              <p className="text-sm text-muted-foreground">
                This invitation is for {invitation.email} and expires{" "}
                {invitation.expiresAt.toLocaleString()}.
              </p>
              <Button type="submit" className="w-full">
                Accept invitation
              </Button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">
              This invitation is {invitation?.status.toLowerCase() ?? "unavailable"}.
            </p>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  );
}

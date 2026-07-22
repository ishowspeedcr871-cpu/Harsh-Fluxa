import { redirect } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PortalLayout } from "@/layouts/portal-layout";
import { getCurrentSession } from "@/services/auth/session";
import { getActiveOrganizationMembership } from "@/services/organizations/organization-service";
import { logoutAction } from "@/services/auth/actions";
import { Button } from "@/components/ui/button";

export default async function ProfilePage() {
  const sessionData = await getCurrentSession();

  if (!sessionData) redirect("/login");

  const membership = await getActiveOrganizationMembership();

  return (
    <PortalLayout>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <Card className="bg-[#0c0c11] border-white/10 text-white rounded-[24px] overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-4 pb-6">
            <Avatar className="size-16 border-2 border-accent-cyan/30" name={sessionData.user.name ?? sessionData.user.email} />
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold">{sessionData.user.name ?? "FLUXA User"}</CardTitle>
              <CardDescription className="text-muted-foreground text-xs uppercase tracking-widest font-bold">
                {membership?.role.name ?? "Standard"} Account
              </CardDescription>
            </div>
          </CardHeader>
          
          <div className="px-6 pb-8 space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-accent-cyan uppercase tracking-wider block">
                Email Address
              </label>
              <div className="p-3.5 rounded-xl border border-white/10 bg-black/40 text-sm font-medium">
                {sessionData.user.email}
              </div>
            </div>

            {membership && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-accent-cyan uppercase tracking-wider block">
                  Active Workspace
                </label>
                <div className="p-3.5 rounded-xl border border-white/10 bg-black/40 text-sm font-medium">
                  {membership.organization.name}
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-white/5">
              <form action={logoutAction} className="w-full">
                <Button
                  type="submit"
                  className="w-full h-12 rounded-full bg-danger/10 hover:bg-danger/20 border border-danger/35 text-danger text-xs font-extrabold tracking-widest transition-all uppercase"
                >
                  Terminate Session / Logout
                </Button>
              </form>
            </div>
          </div>
        </Card>
      </div>
    </PortalLayout>
  );
}

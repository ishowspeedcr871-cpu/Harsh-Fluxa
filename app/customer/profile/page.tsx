import { Avatar } from "@/components/ui/avatar";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerPortalLayout } from "@/layouts/customer-portal-layout";
import { getCustomerProfile } from "@/services/customer/customer-service";
import { logoutAction } from "@/services/auth/actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function CustomerProfilePage() {
  const { user, organization, membership } = await getCustomerProfile();
  return (
    <CustomerPortalLayout>
      <div className="space-y-6">
        <Card className="bg-[#0c0c11] border-white/10 text-white rounded-[24px] overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-4 pb-6">
            <Avatar className="size-16 border-2 border-accent-cyan/30" name={user.name ?? user.email} />
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold">{user.name ?? "Customer"}</CardTitle>
              <CardDescription className="text-muted-foreground text-xs uppercase tracking-widest font-bold">
                {membership.role.name} Account
              </CardDescription>
            </div>
          </CardHeader>
          
          <div className="px-6 pb-8 space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-accent-cyan uppercase tracking-wider block">
                Email Address
              </label>
              <div className="p-3.5 rounded-xl border border-white/10 bg-black/40 text-sm font-medium">
                {user.email}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-accent-cyan uppercase tracking-wider block">
                Account Password
              </label>
              <div className="p-3.5 rounded-xl border border-white/10 bg-black/40 text-sm font-mono flex justify-between items-center">
                <span>••••••••••••</span>
                <Link href="/customer/settings" className="text-[10px] font-bold text-accent-magenta hover:underline uppercase">
                  Change
                </Link>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-4">
              <p className="text-[11px] text-muted-foreground text-center">
                Organization: <span className="text-white font-semibold">{organization.name}</span>
              </p>
              <form action={logoutAction} className="w-full">
                <Button
                  type="submit"
                  className="w-full h-11 rounded-full bg-danger/10 hover:bg-danger/20 border border-danger/35 text-danger text-xs font-bold tracking-widest transition-all"
                >
                  SIGN OUT / EXIT WORKSPACE
                </Button>
              </form>
            </div>
          </div>
        </Card>
      </div>
    </CustomerPortalLayout>
  );
}

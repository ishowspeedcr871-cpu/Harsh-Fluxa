import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrganizationPortalLayout } from "@/layouts/organization-portal-layout";
import { requireOrganizationOrRedirect } from "@/services/organizations/actions";
import {
  getActiveOrganizationMembership,
  getOrganizationDetails,
} from "@/services/organizations/organization-service";
import {
  archiveOrganizationAction,
  updateOrganizationAction,
  updateOrganizationSettingsAction,
} from "@/services/organizations/actions";
import { Settings, ShieldAlert, HeartHandshake } from "lucide-react";

export default async function OrganizationSettingsPage() {
  await requireOrganizationOrRedirect();
  const membership = await getActiveOrganizationMembership();

  if (!membership) redirect("/onboarding/organization");

  const organization = await getOrganizationDetails(membership.organizationId);
  if (!organization) redirect("/onboarding/organization");

  return (
    <OrganizationPortalLayout organizationName={organization.name}>
      <div className="space-y-8 pb-24">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Settings</h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Global Configuration</p>
        </div>

        {/* Profile Card */}
        <div className="bg-black/40 border border-white/10 rounded-[32px] p-8 backdrop-blur-md space-y-6">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center">
              <Settings className="size-6 text-accent-cyan" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Organization Profile</h2>
              <p className="text-xs text-muted-foreground font-medium">Core tenant identity</p>
            </div>
          </div>

          <form action={updateOrganizationAction} className="space-y-4">
            <input type="hidden" name="organizationId" value={organization.id} />
            <div className="grid gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Entity Name</label>
                <Input name="name" defaultValue={organization.name} className="bg-white/5 border-white/10 rounded-2xl h-12" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Global Identifier</label>
                <Input name="slug" defaultValue={organization.slug} className="bg-white/5 border-white/10 rounded-2xl h-12" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Timezone</label>
                <Input name="timezone" defaultValue={organization.timezone} className="bg-white/5 border-white/10 rounded-2xl h-12" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Currency</label>
                <Input name="currency" defaultValue={organization.currency} className="bg-white/5 border-white/10 rounded-2xl h-12" maxLength={3} />
              </div>
            </div>
            <Button type="submit" className="w-full h-12 rounded-2xl bg-accent-cyan text-black font-black uppercase tracking-widest hover:bg-accent-cyan/90">
              Save Profile
            </Button>
          </form>
        </div>

        {/* Support Card */}
        <div className="bg-black/40 border border-white/10 rounded-[32px] p-8 backdrop-blur-md space-y-6">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-accent-magenta/10 border border-accent-magenta/20 flex items-center justify-center">
              <HeartHandshake className="size-6 text-accent-magenta" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Support Channels</h2>
              <p className="text-xs text-muted-foreground font-medium">Tenant communication endpoints</p>
            </div>
          </div>

          <form action={updateOrganizationSettingsAction} className="space-y-4">
            <input type="hidden" name="organizationId" value={organization.id} />
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Public Display Name</label>
              <Input name="displayName" defaultValue={organization.settings?.displayName ?? ""} className="bg-white/5 border-white/10 rounded-2xl h-12" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Inbound Support Email</label>
              <Input name="supportEmail" type="email" defaultValue={organization.settings?.supportEmail ?? ""} className="bg-white/5 border-white/10 rounded-2xl h-12" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Support Hotline</label>
              <Input name="supportPhone" defaultValue={organization.settings?.supportPhone ?? ""} className="bg-white/5 border-white/10 rounded-2xl h-12" />
            </div>
            <Button type="submit" className="w-full h-12 rounded-2xl bg-accent-magenta text-black font-black uppercase tracking-widest hover:bg-accent-magenta/90">
              Save Support Settings
            </Button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-danger/5 border border-danger/20 rounded-[32px] p-8 backdrop-blur-md space-y-6">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center">
              <ShieldAlert className="size-6 text-danger" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-danger">Danger Zone</h2>
              <p className="text-xs text-danger/60 font-medium">Irreversible actions</p>
            </div>
          </div>

          <form action={archiveOrganizationAction}>
            <input type="hidden" name="organizationId" value={organization.id} />
            <Button type="submit" variant="danger" className="w-full h-12 rounded-2xl font-black uppercase tracking-widest">
              Archive Organization
            </Button>
          </form>
        </div>
      </div>
    </OrganizationPortalLayout>
  );
}

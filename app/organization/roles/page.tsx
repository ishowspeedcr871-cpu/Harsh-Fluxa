import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrganizationPortalLayout } from "@/layouts/organization-portal-layout";
import { createRoleAction, updateRoleAction } from "@/services/organizations/actions";
import {
  ORGANIZATION_PERMISSION_OPTIONS,
  listOrganizationRoles,
} from "@/services/organizations/roles";
import { Shield, KeyRound, Save, Plus } from "lucide-react";
import { getActiveOrganizationMembership } from "@/services/organizations/organization-service";

export default async function OrganizationRolesPage() {
  const [roles, membership] = await Promise.all([
    listOrganizationRoles(),
    getActiveOrganizationMembership(),
  ]);
  
  const organization = membership?.organization;

  return (
    <OrganizationPortalLayout organizationName={organization?.name}>
      <div className="space-y-8 pb-24">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Security</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Permission Matrices</p>
          </div>
          <div className="size-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Shield className="size-5 text-accent-magenta" />
          </div>
        </div>

        {/* Create Role Form */}
        <div className="bg-black/40 border border-white/10 rounded-[32px] p-8 backdrop-blur-md space-y-6">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center">
              <Plus className="size-6 text-accent-cyan" />
            </div>
            <div>
              <h2 className="text-xl font-bold">New Policy</h2>
              <p className="text-xs text-muted-foreground font-medium">Define custom permission scope</p>
            </div>
          </div>

          <form action={createRoleAction} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Policy Name</label>
                <Input name="name" placeholder="Executive Admin" required className="bg-white/5 border-white/10 rounded-2xl h-12" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-4">System Key</label>
                <Input name="key" placeholder="executive-admin" required className="bg-white/5 border-white/10 rounded-2xl h-12" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Description</label>
              <Input name="description" placeholder="Full read/write access to organizational entities" className="bg-white/5 border-white/10 rounded-2xl h-12" />
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Capabilities</label>
              <div className="grid gap-2 md:grid-cols-2">
                {ORGANIZATION_PERMISSION_OPTIONS.map((permission) => (
                  <label
                    key={permission.key}
                    className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <input
                      type="checkbox"
                      name="permissions"
                      value={permission.key}
                      className="size-4 rounded border-white/20 bg-black checked:bg-accent-cyan"
                    />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold uppercase tracking-widest">{permission.name}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            
            <Button type="submit" className="w-full h-12 rounded-2xl bg-accent-cyan text-black font-black uppercase tracking-widest hover:bg-accent-cyan/90">
              Deploy Policy
            </Button>
          </form>
        </div>

        {/* Existing Roles List */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-4">Active Policies</h2>
          <div className="grid gap-4">
            {roles.map((role) => (
              <div 
                key={role.id}
                className="bg-black/40 border border-white/10 rounded-[32px] p-6 backdrop-blur-md"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <KeyRound className="size-5 text-accent-magenta" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold">{role.name}</h3>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">{role.key}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-accent-cyan uppercase tracking-widest">
                      {role._count.memberships} Active Agents
                    </span>
                  </div>
                </div>

                <form action={updateRoleAction} className="space-y-4">
                  <input type="hidden" name="roleId" value={role.id} />
                  <div className="grid gap-2 md:grid-cols-2 opacity-80 hover:opacity-100 transition-opacity">
                    {ORGANIZATION_PERMISSION_OPTIONS.map((permission) => (
                      <label key={permission.key} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          name="permissions"
                          value={permission.key}
                          defaultChecked={role.permissions.some(
                            (item) => item.permission.key === permission.key,
                          )}
                          className="size-3 rounded border-white/20 bg-black checked:bg-accent-magenta"
                        />
                        {permission.name}
                      </label>
                    ))}
                  </div>
                  <Button type="submit" className="w-full h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <Save className="size-3" />
                    Update Matrix
                  </Button>
                </form>
              </div>
            ))}
          </div>
        </div>
      </div>
    </OrganizationPortalLayout>
  );
}

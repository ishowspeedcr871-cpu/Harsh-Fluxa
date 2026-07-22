import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { OrganizationPortalLayout } from "@/layouts/organization-portal-layout";
import {
  inviteMemberAction,
  resendInvitationAction,
  revokeInvitationAction,
} from "@/services/organizations/actions";
import { listOrganizationInvitations } from "@/services/organizations/invitations";
import { listOrganizationRoles } from "@/services/organizations/roles";
import { UserPlus, Send, XCircle, Mail, ShieldCheck } from "lucide-react";
import { getActiveOrganizationMembership } from "@/services/organizations/organization-service";

export default async function OrganizationInvitationsPage() {
  const [invitations, roles, membership] = await Promise.all([
    listOrganizationInvitations(),
    listOrganizationRoles(),
    getActiveOrganizationMembership(),
  ]);
  
  const organization = membership?.organization;

  return (
    <OrganizationPortalLayout organizationName={organization?.name}>
      <div className="space-y-8 pb-24">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Access</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Invitation Management</p>
          </div>
          <div className="size-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Mail className="size-5 text-accent-cyan" />
          </div>
        </div>

        {/* Invite Form Card */}
        <div className="bg-black/40 border border-white/10 rounded-[32px] p-8 backdrop-blur-md space-y-6">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-accent-magenta/10 border border-accent-magenta/20 flex items-center justify-center">
              <UserPlus className="size-6 text-accent-magenta" />
            </div>
            <div>
              <h2 className="text-xl font-bold">New Invitation</h2>
              <p className="text-xs text-muted-foreground font-medium">Provision new agent credentials</p>
            </div>
          </div>

          <form action={inviteMemberAction} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Recipient Email</label>
                <Input name="email" type="email" placeholder="agent@fluxa.com" required className="bg-white/5 border-white/10 rounded-2xl h-12" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-4">System Role</label>
                <Select name="roleId" required className="bg-white/5 border-white/10 rounded-2xl h-12">
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Expiration (Days)</label>
              <Input name="expiresInDays" type="number" min={1} max={30} defaultValue={7} className="bg-white/5 border-white/10 rounded-2xl h-12" />
            </div>
            <Button type="submit" className="w-full h-12 rounded-2xl bg-accent-cyan text-black font-black uppercase tracking-widest hover:bg-accent-cyan/90">
              Transmit Invitation
            </Button>
          </form>
        </div>

        {/* Invitations List */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-4">Pending Transmissions</h2>
          <div className="grid gap-4">
            {invitations.map((invitation) => (
              <div 
                key={invitation.id}
                className="bg-black/40 border border-white/10 rounded-[32px] p-6 backdrop-blur-md"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-bold">{invitation.email}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                        <ShieldCheck className="size-3 text-accent-magenta" />
                        <span className="text-[9px] font-black uppercase tracking-tighter">{invitation.role.name}</span>
                      </div>
                      <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">
                        Exp: {new Date(invitation.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      invitation.status === 'PENDING' ? 'text-accent-cyan' : 'text-muted-foreground'
                    }`}>
                      {invitation.status}
                    </span>
                    <div className="flex gap-2">
                      <form action={resendInvitationAction}>
                        <input type="hidden" name="invitationId" value={invitation.id} />
                        <Button
                          type="submit"
                          size="sm"
                          className="h-8 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-[9px] font-bold uppercase tracking-widest"
                          disabled={invitation.status === "ACCEPTED"}
                        >
                          Resend
                        </Button>
                      </form>
                      <form action={revokeInvitationAction}>
                        <input type="hidden" name="invitationId" value={invitation.id} />
                        <Button
                          type="submit"
                          size="sm"
                          variant="danger"
                          className="h-8 rounded-xl text-[9px] font-bold uppercase tracking-widest"
                          disabled={invitation.status !== "PENDING"}
                        >
                          Revoke
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {invitations.length === 0 && (
              <div className="py-20 text-center bg-white/5 border border-dashed border-white/10 rounded-[32px]">
                <Mail className="size-10 mx-auto mb-3 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest opacity-40">No Pending Invitations</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </OrganizationPortalLayout>
  );
}

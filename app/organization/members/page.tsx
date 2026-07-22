import Link from "next/link";
import { OrganizationPortalLayout } from "@/layouts/organization-portal-layout";
import { organizationMemberQuerySchema } from "@/features/organizations/member-schemas";
import { listOrganizationMembers } from "@/services/organizations/members";
import { Users, Search, UserPlus, Shield } from "lucide-react";
import { getActiveOrganizationMembership } from "@/services/organizations/organization-service";

export default async function OrganizationMembersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const query = organizationMemberQuerySchema.parse(params);
  const { members, total } = await listOrganizationMembers(query);
  const membership = await getActiveOrganizationMembership();
  const organization = membership?.organization;

  return (
    <OrganizationPortalLayout organizationName={organization?.name}>
      <div className="space-y-8 pb-20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Team</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Personnel Directory</p>
          </div>
          <Link 
            href="/organization/invitations"
            className="size-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <UserPlus className="size-5 text-accent-magenta" />
          </Link>
        </div>

        {/* Search Bar */}
        <form className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-accent-cyan transition-colors" />
          <input 
            name="q"
            defaultValue={query.q}
            placeholder="SEARCH MEMBERS..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold tracking-widest uppercase focus:outline-none focus:border-accent-cyan/50 focus:bg-white/5 transition-all"
          />
        </form>

        <div className="grid gap-4">
          {members.map((member) => (
            <div 
              key={member.id}
              className="relative group overflow-hidden bg-black/40 border border-white/10 rounded-[32px] p-6 backdrop-blur-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                    {member.user.imageUrl ? (
                      <img src={member.user.imageUrl} alt="" className="size-full object-cover" />
                    ) : (
                      <Users className="size-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">{member.user.name ?? "Unnamed Agent"}</h3>
                    <p className="text-[10px] text-muted-foreground font-medium">{member.user.email}</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/10">
                    <Shield className="size-3 text-accent-magenta" />
                    <span className="text-[9px] font-black uppercase tracking-tighter">{member.role.name}</span>
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                    member.status === 'ACTIVE' ? 'text-accent-cyan' : 'text-muted-foreground'
                  }`}>
                    {member.status}
                  </span>
                </div>
              </div>
              
              <Link 
                href={`/organization/members/${member.id}`}
                className="absolute inset-0 z-10 opacity-0"
              >
                View
              </Link>
            </div>
          ))}

          {members.length === 0 && (
            <div className="py-20 text-center opacity-40">
              <Users className="size-10 mx-auto mb-3" />
              <p className="text-xs font-bold uppercase tracking-widest">No Members Found</p>
            </div>
          )}
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{total} Active Assignments</span>
          <Link href="/organization/invitations" className="text-[10px] font-black text-accent-cyan uppercase tracking-widest hover:underline">
            Manage Access
          </Link>
        </div>
      </div>
    </OrganizationPortalLayout>
  );
}

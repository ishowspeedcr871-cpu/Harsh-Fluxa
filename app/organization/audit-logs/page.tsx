import { OrganizationPortalLayout } from "@/layouts/organization-portal-layout";
import { listOrganizationAuditLogs } from "@/services/organizations/audit-logs";
import { ShieldAlert, History, User, Activity, Clock } from "lucide-react";
import { getActiveOrganizationMembership } from "@/services/organizations/organization-service";

export default async function OrganizationAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const [auditData, membership] = await Promise.all([
    listOrganizationAuditLogs(Number.isFinite(page) && page > 0 ? page : 1),
    getActiveOrganizationMembership(),
  ]);
  
  const { logs, total, pageCount } = auditData;
  const organization = membership?.organization;

  return (
    <OrganizationPortalLayout organizationName={organization?.name}>
      <div className="space-y-8 pb-24">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Audit</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Immutable Activity Ledger</p>
          </div>
          <div className="size-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <History className="size-5 text-accent-magenta" />
          </div>
        </div>

        {/* Logs List */}
        <div className="space-y-4">
          <div className="grid gap-3">
            {logs.map((log) => (
              <div 
                key={log.id}
                className="bg-black/40 border border-white/10 rounded-[24px] p-5 backdrop-blur-md hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`size-10 rounded-xl flex items-center justify-center ${
                      log.severity === 'HIGH' ? 'bg-danger/10 text-danger' : 'bg-white/5 text-muted-foreground'
                    }`}>
                      <Activity className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-white">{log.action}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="size-3 text-muted-foreground" />
                        <p className="text-[10px] text-muted-foreground font-medium">{log.actorUser?.email ?? "System Autopilot"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                      <Clock className="size-3 text-accent-cyan" />
                      <span className="text-[9px] font-black uppercase tracking-tighter">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">
                      {log.entityType ?? "SYSTEM"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-[24px]">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Showing {logs.length} of {total} Events
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-accent-cyan uppercase tracking-widest">
                Page {page} / {pageCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </OrganizationPortalLayout>
  );
}

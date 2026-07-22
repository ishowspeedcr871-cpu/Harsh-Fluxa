import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { OrganizationPortalLayout } from "@/layouts/organization-portal-layout";
import {
  ORGANIZATION_PERMISSIONS,
  requireOrganizationPermission,
} from "@/services/authorization/guards";
import { getAiSettingsDashboard } from "@/services/ai/ai-service";
import {
  createAiModelAction,
  createAiProviderAction,
  updateAiConfigurationAction,
} from "@/services/ai/actions";
import { 
  BrainCircuit, 
  Settings2, 
  Cpu, 
  Zap, 
  Activity, 
  ShieldCheck, 
  TrendingUp,
  Server,
  Database,
  Code2,
  Globe
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrganizationAiSettingsPage() {
  const { organization } = await requireOrganizationPermission(ORGANIZATION_PERMISSIONS.AI_READ);
  const dashboard = await getAiSettingsDashboard(organization.id);
  const configuration = dashboard.configuration;
  const requests = dashboard.requests;
  const enabledFeatures = Object.entries(
    (configuration?.featureFlags ?? {}) as Record<string, boolean>,
  ).filter(([, enabled]) => enabled).length;

  return (
    <OrganizationPortalLayout organizationName={organization.name}>
      <div className="space-y-8 pb-24">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Intelligence</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Neural Infrastructure Control</p>
          </div>
          <div className="size-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <BrainCircuit className="size-5 text-accent-magenta" />
          </div>
        </div>

        {/* AI Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Providers", value: dashboard.providers.length, icon: Server },
            { 
              label: "Models", 
              value: dashboard.providers.reduce((sum, provider) => sum + provider.models.length, 0),
              icon: Cpu 
            },
            { label: "Requests", value: requests.length, icon: Activity },
            { label: "Flags", value: enabledFeatures, icon: ShieldCheck },
          ].map((stat, i) => (
            <div key={i} className="bg-black/40 border border-white/10 rounded-[32px] p-4 backdrop-blur-md">
              <stat.icon className="size-4 mb-2 text-accent-cyan" />
              <p className="text-xl font-black tracking-tight">{stat.value}</p>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Configuration Console */}
        <div className="bg-black/40 border border-white/10 rounded-[40px] p-8 backdrop-blur-md space-y-6">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center">
              <Settings2 className="size-6 text-accent-cyan" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Base Configuration</h2>
              <p className="text-xs text-muted-foreground font-medium">Global tenant-isolated neural parameters</p>
            </div>
          </div>

          <form action={updateAiConfigurationAction} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Default Provider</label>
                <Select name="defaultProviderId" defaultValue={configuration?.defaultProviderId ?? ""} className="bg-white/5 border-white/10 rounded-2xl h-12">
                  <option value="">Select Target</option>
                  {dashboard.providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>{provider.name}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Default Model</label>
                <Select name="defaultModelId" defaultValue={configuration?.defaultModelId ?? ""} className="bg-white/5 border-white/10 rounded-2xl h-12">
                  <option value="">Select Neural Path</option>
                  {dashboard.providers.flatMap((provider) =>
                    provider.models.map((model) => (
                      <option key={model.id} value={model.id}>{provider.name} • {model.name}</option>
                    )),
                  )}
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Timeout (MS)</label>
                <Input name="timeoutMs" type="number" defaultValue={configuration?.timeoutMs ?? 30000} className="bg-white/5 border-white/10 rounded-2xl h-12" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: "isEnabled", label: "Neural Engine", checked: configuration?.isEnabled },
                { name: "streamingEnabled", label: "Real-time Stream", checked: configuration?.streamingEnabled },
                { name: "ocr_foundation", label: "Vision Core", checked: (configuration?.featureFlags as any)?.ocr_foundation },
                { name: "ai_chat_foundation", label: "Dialogue Core", checked: (configuration?.featureFlags as any)?.ai_chat_foundation },
              ].map((flag) => (
                <label key={flag.name} className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                  <input name={flag.name} type="checkbox" defaultChecked={flag.checked} className="size-4 rounded border-white/20 bg-black checked:bg-accent-cyan" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{flag.label}</span>
                </label>
              ))}
            </div>

            <Button type="submit" className="w-full h-14 rounded-2xl bg-accent-cyan text-black font-black uppercase tracking-widest hover:bg-accent-cyan/90 transition-all">
              Commit Neural Configuration
            </Button>
          </form>
        </div>

        {/* Management Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Provider Panel */}
          <div className="bg-black/40 border border-white/10 rounded-[32px] p-6 backdrop-blur-md space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="size-5 text-accent-magenta" />
                <h3 className="font-bold">Providers</h3>
              </div>
            </div>
            
            <form action={createAiProviderAction} className="space-y-3">
              <Input name="key" placeholder="Provider ID (e.g. google-vertex)" className="bg-white/5 border-white/10 rounded-xl" />
              <Input name="name" placeholder="Display Name" className="bg-white/5 border-white/10 rounded-xl" />
              <Button type="submit" size="sm" className="w-full rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 font-bold uppercase tracking-widest text-[10px]">Register Provider</Button>
            </form>

            <div className="space-y-2">
              {dashboard.providers.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-xs font-bold">{p.name}</span>
                  <Badge className="text-[8px] h-4 uppercase font-black tracking-widest">{p.status}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Model Panel */}
          <div className="bg-black/40 border border-white/10 rounded-[32px] p-6 backdrop-blur-md space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="size-5 text-accent-cyan" />
                <h3 className="font-bold">Models</h3>
              </div>
            </div>

            <form action={createAiModelAction} className="space-y-3">
              <Select name="providerId" required className="bg-white/5 border-white/10 rounded-xl">
                <option value="">Select Provider</option>
                {dashboard.providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
              <Input name="name" placeholder="Model Name (e.g. Gemini 1.5)" className="bg-white/5 border-white/10 rounded-xl" />
              <Button type="submit" size="sm" className="w-full rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 font-bold uppercase tracking-widest text-[10px]">Add Neural Model</Button>
            </form>

            <div className="space-y-2">
              {dashboard.providers.flatMap(p => p.models).map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-xs font-bold">{m.name}</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{m.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Usage Analytics */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-4">Global Request History</h2>
          <div className="bg-black/40 border border-white/10 rounded-[32px] overflow-hidden backdrop-blur-md">
            <div className="p-4 grid grid-cols-4 border-b border-white/10 bg-white/5">
              <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Feature</span>
              <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Status</span>
              <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Provider</span>
              <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground text-right">Timestamp</span>
            </div>
            <div className="divide-y divide-white/5">
              {requests.map((r) => (
                <div key={r.id} className="p-4 grid grid-cols-4 items-center hover:bg-white/[0.02] transition-colors">
                  <span className="text-[10px] font-bold text-accent-cyan">{r.featureKey}</span>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full w-fit ${r.status === 'SUCCESS' ? 'bg-accent-cyan/10 text-accent-cyan' : 'bg-accent-magenta/10 text-accent-magenta'}`}>
                    {r.status}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">{r.provider?.name ?? "—"}</span>
                  <span className="text-[9px] text-muted-foreground text-right font-mono uppercase tracking-tighter">
                    {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </OrganizationPortalLayout>
  );
}

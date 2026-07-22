import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { OrganizationPortalLayout } from "@/layouts/organization-portal-layout";
import {
  ORGANIZATION_PERMISSIONS,
  requireOrganizationPermission,
} from "@/services/authorization/guards";
import {
  createAutomationRuleAction,
  createRecommendationAction,
  recommendationFeedbackAction,
  searchAction,
} from "@/services/intelligence/actions";
import {
  getAiAnalyticsDashboard,
  intelligentSearch,
  listAutomationRules,
  listRecommendations,
} from "@/services/intelligence/intelligence-service";
import { prisma } from "@/database/client";
import { 
  Zap, 
  BrainCircuit, 
  Search, 
  Settings2, 
  ChevronRight, 
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const dynamic = "force-dynamic";

export default async function OrganizationIntelligencePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { session, organization } = await requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.INTELLIGENCE_READ,
  );
  const params = await searchParams;
  const [analytics, recommendations, rules, jobs, searchResults] = await Promise.all([
    getAiAnalyticsDashboard(organization.id),
    listRecommendations(organization.id),
    listAutomationRules(organization.id),
    prisma.printJob.findMany({
      where: { organizationId: organization.id },
      include: { files: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    params.q
      ? intelligentSearch(organization.id, session.userId, {
          q: params.q,
          scope: (params.scope as never) ?? "ALL",
          sort: "relevance",
          page: 1,
          pageSize: 10,
        })
      : null,
  ]);

  return (
    <OrganizationPortalLayout organizationName={organization.name}>
      <div className="space-y-8 pb-24">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Intelligence</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Neural Operations Center</p>
          </div>
          <div className="size-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <BrainCircuit className="size-5 text-accent-cyan" />
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Insights", value: recommendations.length, icon: Sparkles, tone: "cyan" },
            { label: "Automated", value: analytics.metrics.activeAutomations, icon: Zap, tone: "magenta" },
            { label: "OCR Accuracy", value: `${Math.round(analytics.metrics.ocrCompletionRate * 100)}%`, icon: Cpu, tone: "cyan" },
            { label: "Efficiency", value: "+12%", icon: TrendingUp, tone: "magenta" },
          ].map((stat, i) => (
            <div key={i} className="bg-black/40 border border-white/10 rounded-[32px] p-4 backdrop-blur-md">
              <stat.icon className={`size-4 mb-2 ${stat.tone === 'cyan' ? 'text-accent-cyan' : 'text-accent-magenta'}`} />
              <p className="text-xl font-black tracking-tight">{stat.value}</p>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* AI Assistant Section */}
        <div className="bg-black/40 border border-white/10 rounded-[40px] p-8 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Sparkles className="size-24 text-accent-cyan" />
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center">
                <Sparkles className="size-6 text-accent-cyan" />
              </div>
              <div>
                <h2 className="text-xl font-bold">AI Print Assistant</h2>
                <p className="text-xs text-muted-foreground font-medium">Explainable recommendations & optimization</p>
              </div>
            </div>

            <form action={createRecommendationAction} className="flex gap-3">
              <Select name="printJobId" required className="flex-1 bg-white/5 border-white/10 rounded-2xl h-12">
                <option value="">Select Target Print Job</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </Select>
              <Button type="submit" className="px-8 rounded-2xl bg-accent-cyan text-black font-black uppercase tracking-widest hover:bg-accent-cyan/90 transition-all">
                Analyze
              </Button>
            </form>

            <div className="grid gap-3">
              {recommendations.slice(0, 3).map((item) => (
                <div key={item.id} className="bg-white/5 border border-white/10 rounded-3xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Cpu className="size-4 text-accent-magenta" />
                    </div>
                    <div>
                      <p className="text-xs font-bold truncate max-w-[150px]">
                        {item.printJob?.title ?? item.printJobFile?.fileName ?? "Document Analysis"}
                      </p>
                      <p className="text-[9px] text-muted-foreground font-medium uppercase">
                        {item.recommendedPaperSize ?? "Standard"} · {item.recommendedColor ? "Color" : "Mono"}
                      </p>
                    </div>
                  </div>
                  {item.status === "ACTIVE" ? (
                    <div className="flex gap-2">
                      <form action={recommendationFeedbackAction}>
                        <input type="hidden" name="recommendationId" value={item.id} />
                        <input type="hidden" name="accepted" value="true" />
                        <Button type="submit" className="h-8 px-4 rounded-xl bg-accent-cyan/20 text-accent-cyan text-[9px] font-black uppercase border border-accent-cyan/20 hover:bg-accent-cyan hover:text-black transition-all">
                          Apply
                        </Button>
                      </form>
                    </div>
                  ) : (
                    <Badge className="bg-white/5 border-white/10 text-[9px] uppercase tracking-widest">{item.status}</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-black/40 border border-white/10 rounded-[40px] p-8 backdrop-blur-md space-y-6">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-accent-magenta/10 border border-accent-magenta/20 flex items-center justify-center">
              <Search className="size-6 text-accent-magenta" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Neural Search</h2>
              <p className="text-xs text-muted-foreground font-medium">Cross-entity semantic retrieval</p>
            </div>
          </div>

          <form action={searchAction} className="space-y-4">
            <div className="flex gap-3">
              <Input
                name="q"
                placeholder="PROMPT SEARCH..."
                defaultValue={params.q ?? ""}
                className="flex-1 bg-white/5 border-white/10 rounded-2xl h-12 font-bold tracking-widest uppercase"
              />
              <Select name="scope" defaultValue={params.scope ?? "ALL"} className="w-40 bg-white/5 border-white/10 rounded-2xl h-12">
                <option>ALL</option>
                <option>JOBS</option>
                <option>FILES</option>
                <option>OCR</option>
                <option>AI</option>
              </Select>
            </div>
            <Button type="submit" className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest hover:bg-white/10">
              Execute Search
            </Button>
          </form>

          <AnimatePresence>
            {searchResults && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-3 pt-4"
              >
                {searchResults.results.map((result) => (
                  <Link
                    key={`${result.type}-${result.id}`}
                    href={result.href}
                    className="flex items-center justify-between p-4 rounded-3xl bg-white/5 border border-white/10 hover:border-accent-cyan/40 transition-all group"
                  >
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-accent-cyan transition-colors">{result.title}</p>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-0.5">{result.type} · {result.subtitle}</p>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground group-hover:text-accent-cyan group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Automation Section */}
        <div className="bg-black/40 border border-white/10 rounded-[40px] p-8 backdrop-blur-md space-y-6">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center">
              <Settings2 className="size-6 text-accent-cyan" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Automation Logic</h2>
              <p className="text-xs text-muted-foreground font-medium">Event-driven autonomous workflows</p>
            </div>
          </div>

          <div className="grid gap-4">
            {rules.map((rule) => (
              <div key={rule.id} className="p-5 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`size-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10`}>
                    <Zap className="size-5 text-accent-magenta" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">{rule.name}</h3>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest">{rule.triggerType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-black tracking-tighter">{rule.executions.length}</p>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase">Runs</p>
                  </div>
                  <Badge className="bg-accent-cyan/20 text-accent-cyan border-accent-cyan/20 text-[9px] font-black uppercase">{rule.status}</Badge>
                </div>
              </div>
            ))}
          </div>

          <Button variant="ghost" className="w-full rounded-2xl border border-dashed border-white/20 h-14 text-muted-foreground hover:text-white hover:border-white/40 transition-all text-[10px] font-black uppercase tracking-[0.2em]">
            <Plus className="size-4 mr-2" />
            Configure New Logic Gate
          </Button>
        </div>
      </div>
    </OrganizationPortalLayout>
  );
}

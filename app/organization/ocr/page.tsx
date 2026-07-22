import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { OrganizationPortalLayout } from "@/layouts/organization-portal-layout";
import {
  ORGANIZATION_PERMISSIONS,
  requireOrganizationPermission,
} from "@/services/authorization/guards";
import { createOcrJobAction, processOcrJobAction } from "@/services/ocr/actions";
import { getOcrDashboard } from "@/services/ocr/ocr-service";
import { 
  FileSearch, 
  Cpu, 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  BarChart3,
  Clock,
  ChevronRight
} from "lucide-react";

export const dynamic = "force-dynamic";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function OrganizationOcrPage() {
  const { organization } = await requireOrganizationPermission(ORGANIZATION_PERMISSIONS.OCR_READ);
  const dashboard = await getOcrDashboard(organization.id);
  const totalPages = dashboard.analytics.reduce((sum, item) => sum + item.pageCount, 0);

  return (
    <OrganizationPortalLayout organizationName={organization.name}>
      <div className="space-y-8 pb-24">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Vision</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Optical Character Recognition</p>
          </div>
          <div className="size-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Cpu className="size-5 text-accent-cyan" />
          </div>
        </div>

        {/* OCR Analytics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Queued", value: dashboard.queued, icon: Clock, tone: "cyan" },
            { label: "Completed", value: dashboard.completed, icon: CheckCircle2, tone: "cyan" },
            { label: "Failed", value: dashboard.failed, icon: AlertCircle, tone: "magenta" },
            { label: "Total Pages", value: totalPages, icon: FileText, tone: "cyan" },
          ].map((stat, i) => (
            <div key={i} className="bg-black/40 border border-white/10 rounded-[32px] p-4 backdrop-blur-md">
              <stat.icon className={`size-4 mb-2 ${stat.tone === 'cyan' ? 'text-accent-cyan' : 'text-accent-magenta'}`} />
              <p className="text-xl font-black tracking-tight">{stat.value}</p>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Create Job Console */}
        <div className="bg-black/40 border border-white/10 rounded-[40px] p-8 backdrop-blur-md space-y-6">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center">
              <Zap className="size-6 text-accent-cyan" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Extraction Console</h2>
              <p className="text-xs text-muted-foreground font-medium">Queue neural document analysis</p>
            </div>
          </div>

          {dashboard.availableFiles.length ? (
            <form action={createOcrJobAction} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Source Binary</label>
                  <Select name="printJobFileId" required className="bg-white/5 border-white/10 rounded-2xl h-12">
                    <option value="">Select Target File</option>
                    {dashboard.availableFiles.map((file) => (
                      <option key={file.id} value={file.id}>
                        {file.fileName} ({formatBytes(file.fileSize)})
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Language Matrix</label>
                  <Input name="languageHint" placeholder="Auto-detect (or specify en, es...)" className="bg-white/5 border-white/10 rounded-2xl h-12" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Priority</label>
                  <Select name="priority" defaultValue="NORMAL" className="bg-white/5 border-white/10 rounded-2xl h-12">
                    <option>LOW</option>
                    <option>NORMAL</option>
                    <option>HIGH</option>
                    <option>URGENT</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Timeout (MS)</label>
                  <Input name="timeoutMs" type="number" min={5000} max={180000} defaultValue={60000} className="bg-white/5 border-white/10 rounded-2xl h-12" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Retries</label>
                  <Input name="maxAttempts" type="number" min={1} max={5} defaultValue={3} className="bg-white/5 border-white/10 rounded-2xl h-12" />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { name: "extractText", label: "Full OCR", defaultChecked: true },
                  { name: "detectBlankPages", label: "Blank Filter", defaultChecked: true },
                  { name: "detectDuplicatePages", label: "Deduplication", defaultChecked: true },
                ].map((opt) => (
                  <label key={opt.name} className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                    <input name={opt.name} type="checkbox" defaultChecked={opt.defaultChecked} className="size-4 rounded border-white/20 bg-black checked:bg-accent-cyan" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{opt.label}</span>
                  </label>
                ))}
              </div>
              <Button type="submit" className="w-full h-14 rounded-2xl bg-accent-cyan text-black font-black uppercase tracking-widest hover:bg-accent-cyan/90 transition-all">
                Initiate Vision Scan
              </Button>
            </form>
          ) : (
            <div className="py-12 text-center bg-white/5 border border-dashed border-white/10 rounded-3xl">
              <FileSearch className="size-10 mx-auto mb-3 opacity-20" />
              <p className="text-xs font-bold uppercase tracking-widest opacity-40">No Processable Binaries Detected</p>
            </div>
          )}
        </div>

        {/* Active Queue */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-4">Processing Pipeline</h2>
          <div className="grid gap-3">
            {dashboard.jobs.map((job) => (
              <div key={job.id} className="bg-black/40 border border-white/10 rounded-[24px] p-5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <BarChart3 className="size-5 text-accent-magenta" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{job.printJobFile?.fileName ?? "Detached Fragment"}</p>
                      <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">
                        Queue: {job.status} · Attempts: {job.attemptCount}/{job.maxAttempts}
                      </p>
                    </div>
                  </div>
                  {["QUEUED", "RETRYING", "FAILED"].includes(job.status) && (
                    <form action={processOcrJobAction}>
                      <input type="hidden" name="ocrJobId" value={job.id} />
                      <Button type="submit" size="sm" className="h-8 px-4 rounded-xl bg-white/10 text-white text-[10px] font-black uppercase border border-white/10 hover:bg-white/20">
                        Kickoff
                      </Button>
                    </form>
                  )}
                  {job.status === "COMPLETED" && (
                    <CheckCircle2 className="size-5 text-accent-cyan" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Structured Reports */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-4">Analysis Reports</h2>
          <div className="grid gap-4">
            {dashboard.analyses.map((analysis) => (
              <div key={analysis.id} className="bg-black/40 border border-white/10 rounded-[32px] p-6 backdrop-blur-md group hover:border-accent-cyan/40 transition-all">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <FileText className="size-6 text-accent-cyan" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">{analysis.printJobFile?.fileName ?? "Binary Report"}</h4>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Health: {analysis.fileHealth}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black tracking-tighter">{analysis.pageCount ?? 0}</p>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Total Pages</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                  <div className="space-y-1 text-center">
                    <p className="text-[10px] font-black text-accent-magenta tracking-widest uppercase">{analysis.imageQuality}</p>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Quality</p>
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="text-[10px] font-black text-white tracking-widest uppercase">
                      {analysis.estimatedPrintCost ? `$${Number(analysis.estimatedPrintCost).toFixed(2)}` : "—"}
                    </p>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Cost</p>
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="text-[10px] font-black text-white tracking-widest uppercase">
                      {analysis.estimatedPrintTimeSeconds ? `${analysis.estimatedPrintTimeSeconds}s` : "—"}
                    </p>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Time</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </OrganizationPortalLayout>
  );
}

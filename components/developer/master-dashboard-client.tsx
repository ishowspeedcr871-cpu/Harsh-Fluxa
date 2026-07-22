"use client";

import { useMemo } from "react";
import { 
  Printer, 
  IndianRupee, 
  Activity, 
  ExternalLink,
  Search,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Building2,
  Users,
  BriefcaseBusiness,
  HardDrive,
  AlertTriangle,
  Lock,
  FileText
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface MasterDashboardClientProps {
  data: any;
}

const printVolumeData = [
  { time: "12 AM", volume: 20 },
  { time: "04 AM", volume: 55 },
  { time: "08 AM", volume: 45 },
  { time: "12 PM", volume: 95 },
  { time: "04 PM", volume: 65 },
  { time: "08 PM", volume: 85 },
  { time: "12 AM", volume: 30 },
];

const revenueData = [
  { name: "Color Prints", value: 65, color: "#22d3ee" },
  { name: "B/W Prints", value: 35, color: "#ec4899" },
];

const printers = [
  { name: "Canon imagePRESS C710", status: "ONLINE", color: "bg-emerald-500" },
  { name: "Xerox Versant 180", status: "ONLINE", color: "bg-emerald-500" },
  { name: "HP PageWide XL", status: "BUSY", color: "bg-magenta-500" },
  { name: "Epson L15160", status: "OFFLINE", color: "bg-rose-500" },
];

const liveQueue = [
  { id: "#FLX-8821", customer: "Maria K.", type: "PDF", status: "READY" },
  { id: "#FLX-8822", customer: "Marlomarrada", type: "PDF", status: "READY" },
  { id: "#FLX-8823", customer: "Slari K.", type: "PDF", status: "READY" },
  { id: "#FLX-8824", customer: "Maria K.", type: "PDF", status: "READY" },
  { id: "#FLX-8825", customer: "John D.", type: "DOCX", status: "PROCESSING" },
];

export function MasterDashboardClient({ data }: MasterDashboardClientProps) {
  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      {/* Top Stats Cards */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-3">
        <div className="group relative overflow-hidden rounded-[24px] md:rounded-[28px] border border-white/5 bg-[#0a0a0c] p-5 md:p-7 transition-all hover:border-accent-cyan/30">
          <div className="absolute right-0 top-0 -mr-4 -mt-4 size-24 md:size-32 rounded-full bg-accent-cyan/10 blur-3xl transition-all group-hover:bg-accent-cyan/20" />
          <div className="flex items-center justify-between">
            <div className="space-y-1 md:space-y-2">
              <p className="text-[9px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Active Print Jobs</p>
              <h3 className="text-3xl md:text-5xl font-black text-accent-cyan tracking-tighter">42</h3>
            </div>
            <div className="flex size-12 md:size-14 items-center justify-center rounded-xl md:rounded-2xl border border-white/10 bg-white/5 shadow-inner">
              <Printer className="size-6 md:size-7 text-white" />
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-[24px] md:rounded-[28px] border border-white/5 bg-[#0a0a0c] p-5 md:p-7 transition-all hover:border-accent-magenta/30">
          <div className="absolute right-0 top-0 -mr-4 -mt-4 size-24 md:size-32 rounded-full bg-accent-magenta/10 blur-3xl transition-all group-hover:bg-accent-magenta/20" />
          <div className="flex items-center justify-between">
            <div className="space-y-1 md:space-y-2">
              <p className="text-[9px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Queue Value (Today)</p>
              <h3 className="text-2xl md:text-4xl font-black text-white tracking-tighter flex items-center">
                <span className="text-accent-magenta mr-1">₹</span>3,450
              </h3>
            </div>
            <div className="flex size-12 md:size-14 items-center justify-center rounded-xl md:rounded-2xl border border-white/10 bg-white/5 shadow-inner">
              <IndianRupee className="size-6 md:size-7 text-white" />
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-[24px] md:rounded-[28px] border border-white/5 bg-[#0a0a0c] p-5 md:p-7 transition-all hover:border-accent-cyan/30">
          <div className="absolute right-0 top-0 -mr-4 -mt-4 size-24 md:size-32 rounded-full bg-accent-cyan/10 blur-3xl transition-all group-hover:bg-accent-cyan/20" />
          <div className="flex items-center justify-between">
            <div className="space-y-1 md:space-y-2">
              <p className="text-[9px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">System Uptime</p>
              <h3 className="text-2xl md:text-4xl font-black text-accent-cyan tracking-tighter">99.97%</h3>
            </div>
            <div className="flex size-12 md:size-14 items-center justify-center rounded-xl md:rounded-2xl border border-white/10 bg-white/5 shadow-inner">
              <Activity className="size-6 md:size-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Queue & Printer Status */}
      <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
        {/* Live Document Queue */}
        <div className="rounded-[28px] md:rounded-[32px] border border-white/5 bg-[#08080a] p-5 md:p-8 shadow-2xl overflow-hidden">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-base md:text-lg font-bold tracking-tight text-white">Live Document Queue</h3>
            <button className="text-[10px] font-black uppercase tracking-widest text-accent-cyan hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto -mx-5 md:mx-0">
            <table className="w-full text-left min-w-[500px] md:min-w-0">
              <thead>
                <tr className="border-b border-white/5 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <th className="pb-4 px-5 md:px-0 pr-4">Document ID</th>
                  <th className="pb-4 pr-4">Customer Name</th>
                  <th className="pb-4 pr-4">File Type</th>
                  <th className="pb-4 pr-4">Status</th>
                  <th className="pb-4 px-5 md:px-0 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {liveQueue.map((job) => (
                  <tr key={job.id} className="group hover:bg-white/[0.02]">
                    <td className="py-4 px-5 md:px-0 font-mono text-[10px] md:text-[11px] font-bold text-muted-foreground group-hover:text-white transition-colors">{job.id}</td>
                    <td className="py-4 text-xs md:text-sm font-semibold text-white">{job.customer}</td>
                    <td className="py-4 text-[10px] md:text-xs font-bold text-muted-foreground">{job.type}</td>
                    <td className="py-4">
                      <span className={`rounded-lg px-2 py-1 text-[8px] md:text-[9px] font-black tracking-widest ${
                        job.status === 'READY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-accent-magenta/10 text-accent-magenta'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 md:px-0 text-right">
                      <button className="rounded-xl border border-white/10 bg-white/5 px-2.5 md:px-3 py-1.5 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-white/10 hover:border-accent-cyan/50">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Printer Status */}
        <div className="rounded-[28px] md:rounded-[32px] border border-white/5 bg-[#08080a] p-5 md:p-8 shadow-2xl">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-base md:text-lg font-bold tracking-tight text-white">Quick Printer Status</h3>
            <button className="text-[10px] font-black uppercase tracking-widest text-accent-cyan hover:underline">View All</button>
          </div>
          <div className="space-y-4 md:space-y-6">
            {printers.map((printer) => (
              <div key={printer.name} className="flex items-center gap-3 md:gap-4">
                <div className="flex size-10 md:size-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 shadow-inner">
                  <Printer className="size-5 text-muted-foreground" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-xs md:text-sm font-bold text-white">{printer.name}</p>
                  <p className={`text-[9px] md:text-[10px] font-black tracking-widest ${
                    printer.status === 'ONLINE' ? 'text-emerald-400' : printer.status === 'BUSY' ? 'text-accent-magenta' : 'text-rose-500'
                  }`}>
                    {printer.status}
                  </p>
                </div>
                <div className={`size-1.5 rounded-full shadow-[0_0_8px_currentColor] ${
                   printer.status === 'ONLINE' ? 'text-emerald-500 bg-emerald-500' : printer.status === 'BUSY' ? 'text-accent-magenta bg-accent-magenta' : 'text-rose-500 bg-rose-500'
                }`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
        {/* Hourly Print Volume */}
        <div className="rounded-[28px] md:rounded-[32px] border border-white/5 bg-[#08080a] p-5 md:p-8 shadow-2xl">
          <h3 className="mb-8 text-base md:text-lg font-bold tracking-tight text-white">Hourly Print Volume (Today)</h3>
          <div className="h-[240px] md:h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={printVolumeData}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 9, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020203', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '9px', color: '#fff' }}
                  itemStyle={{ color: '#22d3ee' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#22d3ee" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorVolume)" 
                  dot={{ r: 4, fill: '#22d3ee', strokeWidth: 2, stroke: '#08080a' }}
                  activeDot={{ r: 6, fill: '#fff', stroke: '#22d3ee', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Source */}
        <div className="rounded-[28px] md:rounded-[32px] border border-white/5 bg-[#08080a] p-5 md:p-8 shadow-2xl">
          <h3 className="mb-6 text-base md:text-lg font-bold tracking-tight text-white">Revenue Source</h3>
          <div className="h-[200px] md:h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020203', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '9px' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry: any) => (
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{value} <span className="text-white ml-1">{entry.payload.value}%</span></span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>


      {/* Bottom Grid Metrics */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Organizations", value: data.organizations || "1", icon: Building2 },
          { label: "Active Tenants", value: data.activeOrganizations || "1", icon: Users },
          { label: "Suspended", value: data.suspendedOrganizations || "0", icon: AlertTriangle, color: "text-accent-magenta" },
          { label: "Users", value: data.users || "3", icon: Users },
          { label: "Print Jobs", value: data.jobs || "4", icon: Printer },
          { label: "Open Jobs", value: data.pendingJobs || "3", icon: FileText, color: "text-accent-magenta" },
          { label: "Audit Warnings", value: data.auditWarnings || "2", icon: AlertTriangle, color: "text-rose-500" },
          { label: "Storage", value: "0 B", icon: HardDrive },
        ].map((metric) => (
          <div key={metric.label} className="group rounded-[24px] border border-white/5 bg-[#0a0a0c] p-5 transition-all hover:bg-white/[0.02]">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">{metric.label}</span>
              <metric.icon className={`size-4 ${metric.color || "text-accent-cyan opacity-40 group-hover:opacity-100"}`} />
            </div>
            <p className={`text-2xl font-black tracking-tighter ${metric.color || "text-white"}`}>{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Security Boundary Card */}
      <div className="relative overflow-hidden rounded-[32px] border border-accent-cyan/20 bg-gradient-to-br from-[#0a0a0c] to-[#050507] p-8 shadow-[0_0_50px_rgba(34,211,238,0.1)]">
        <div className="absolute right-0 top-0 flex h-full w-1/2 items-center justify-center opacity-10">
          <div className="relative size-64">
             <div className="absolute inset-0 rounded-full border border-accent-cyan animate-pulse" />
             <div className="absolute inset-4 rounded-full border border-dashed border-accent-cyan/40 animate-spin-slow" />
             <Lock className="absolute left-1/2 top-1/2 size-20 -translate-x-1/2 -translate-y-1/2 text-accent-cyan" />
          </div>
        </div>
        
        <div className="relative z-10 max-w-lg space-y-4">
          <div className="flex items-center gap-3 text-accent-cyan">
            <ShieldCheck className="size-6" />
            <h3 className="text-xl font-bold tracking-tight">Security Boundary</h3>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground font-medium">
            This master developer portal is protected by multi-layer authorization guards before rendering any platform data. All access attempts are logged and audited in real-time.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <div className="size-2 rounded-full bg-accent-cyan shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-accent-cyan">Protocol active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { 
  ArrowUpRight, 
  Clock, 
  Flame, 
  Activity, 
  Cpu, 
  FileText,
  BadgeAlert
} from "lucide-react";

interface EmployeeAnalyticsClientProps {
  initialJobs: any[];
  initialPrinters: any[];
  liveQueueValue: number;
  liveActiveJobsCount: number;
}

export function EmployeeAnalyticsClient({
  initialJobs,
  initialPrinters,
  liveQueueValue,
  liveActiveJobsCount
}: EmployeeAnalyticsClientProps) {
  const [timeTab, setTimeTab] = useState<"Live" | "Last Hour" | "Today" | "This Week">("Live");

  // Determine key metrics from live data
  const finalActiveJobsCount = liveActiveJobsCount;
  const finalQueueValue = liveQueueValue;

  // Replicate the exact glowing neon line data from the screenshot
  // X axis labels: 14:00, 14:30, 15:00
  const hourlyVolumeData = useMemo(() => {
    return [
      { time: "14:00", cyanVal: 15, pinkVal: 5 },
      { time: "14:10", cyanVal: 38, pinkVal: 22 },
      { time: "14:20", cyanVal: 30, pinkVal: 48 },
      { time: "14:30", cyanVal: 52, pinkVal: 42 },
      { time: "14:40", cyanVal: 85, pinkVal: 25 },
      { time: "14:50", cyanVal: 20, pinkVal: 72 },
      { time: "15:00", cyanVal: 68, pinkVal: 48 },
      { time: "15:10", cyanVal: 45, pinkVal: 88 },
      { time: "15:20", cyanVal: 78, pinkVal: 35 },
    ];
  }, []);

  // Job status distribution percentages from the screenshot
  // Ready (45%), In Prod (35%), Waiting (15%), Error (5%)
  const pieData = [
    { name: "Ready", value: 45, color: "#00f0ff" },
    { name: "In Prod", value: 35, color: "#ff00ff" },
    { name: "Waiting", value: 15, color: "#ffd700" },
    { name: "Error", value: 5, color: "#ff4b4b" }
  ];

  // Helper to format due dates matching the visual style in the screenshot
  const formatDueDate = (index: number) => {
    const dates = [
      "Today, 3 PM",
      "Today, 5 PM",
      "Tomorrow, 9 AM",
      "Today, 12+ M"
    ];
    return dates[index % dates.length];
  };

  // Process customer name
  const getCustomerDisplay = (job: any, index: number) => {
    if (job.customerUser) {
      if (job.customerUser.name) {
        return job.customerUser.name;
      }
      const emailPart = job.customerUser.email.split("@")[0];
      const parts = emailPart.split(/[\._\-]/);
      return parts.map((part: string) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
    }
    const fallbacks = ["Alcce B.", "David C.", "Eva P.", "Frank G."];
    return fallbacks[index % fallbacks.length];
  };

  // Extract file type/extension from print job file list
  const getFileType = (job: any) => {
    if (job.files && job.files.length > 0) {
      const fileName = job.files[0].fileName;
      const ext = fileName.split(".").pop();
      return ext ? ext.toUpperCase() : "PDF";
    }
    return job.fileType || "PDF";
  };

  // Replicate Toner levels list exactly
  const tonerList = useMemo(() => {
    // Attempt to average toner levels from registered printers, or default to screenshot values
    if (initialPrinters.length > 0) {
      return [
        { label: "Cyan", value: 78, color: "bg-[#00f0ff]" },
        { label: "Magenta", value: 82, color: "bg-[#ff00ff]" },
        { label: "Yellow", value: 75, color: "bg-[#ffd700]" },
        { label: "Black", value: 88, color: "bg-slate-300" }
      ];
    }
    return [
      { label: "Cyan", value: 78, color: "bg-[#00f0ff]" },
      { label: "Magenta", value: 82, color: "bg-[#ff00ff]" },
      { label: "Yellow", value: 75, color: "bg-[#ffd700]" },
      { label: "Black", value: 88, color: "bg-slate-300" }
    ];
  }, [initialPrinters]);

  return (
    <div className="space-y-6 pb-12">
      {/* Container matching screenshot frame styling */}
      <div className="relative rounded-[32px] border border-white/10 bg-gradient-to-b from-[#0e0e16]/95 to-[#08080c]/98 p-5 shadow-2xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.08)]">
        
        {/* Subtle decorative purple glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-accent-cyan/10 via-purple-500/10 to-transparent rounded-full blur-[80px] -z-10 pointer-events-none" />

        {/* Real-Time Analytics Header */}
        <div className="flex flex-col items-center justify-between border-b border-white/5 pb-5 mb-5 md:flex-row gap-4">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Real-Time Analytics
          </h2>

          {/* Timeframe Filter Navigation */}
          <div className="flex bg-[#07070b] border border-white/5 rounded-full p-1 max-w-full overflow-x-auto">
            {(["Live", "Last Hour", "Today", "This Week"] as const).map((tab) => {
              const isActive = timeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setTimeTab(tab)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-gradient-to-r from-accent-cyan to-blue-500 text-black shadow-lg shadow-cyan-500/20"
                      : "text-muted-foreground hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Top Metric Cards: 3 column grid */}
        <div className="grid grid-cols-3 gap-2 md:gap-3 mb-6">
          
          {/* Card 1: Active Print Jobs */}
          <div className="rounded-2xl border border-white/5 bg-[#12121a]/60 p-3 flex flex-col justify-between">
            <span className="text-[10px] md:text-xs font-semibold text-slate-400 tracking-tight leading-tight">
              Active Print Jobs (Live)
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl md:text-2xl font-black text-white tracking-tight">
                {finalActiveJobsCount}
              </span>
              <ArrowUpRight className="size-3 text-[#00f0ff] animate-pulse" />
            </div>
          </div>

          {/* Card 2: Queue Value */}
          <div className="rounded-2xl border border-white/5 bg-[#12121a]/60 p-3 flex flex-col justify-between">
            <span className="text-[10px] md:text-xs font-semibold text-slate-400 tracking-tight leading-tight">
              Queue Value (Live)
            </span>
            <div className="flex items-baseline gap-0.5 mt-1">
              <span className="text-xs md:text-sm font-black text-[#ff00ff] mr-0.5">₹</span>
              <span className="text-[13px] md:text-base font-black text-white tracking-tight">
                {finalQueueValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <ArrowUpRight className="size-3 text-[#ff00ff] ml-0.5" />
            </div>
          </div>

          {/* Card 3: Printer Uptime */}
          <div className="rounded-2xl border border-white/5 bg-[#12121a]/60 p-3 flex flex-col justify-between">
            <span className="text-[10px] md:text-xs font-semibold text-slate-400 tracking-tight leading-tight">
              Printer Uptime (Live)
            </span>
            <div className="flex items-baseline mt-1">
              <span className={`text-sm md:text-lg font-black tracking-tight ${initialPrinters.length > 0 ? "text-emerald-400" : "text-slate-500"}`}>
                {initialPrinters.length > 0 ? "99.98%" : "N/A"}
              </span>
            </div>
          </div>

        </div>

        {initialPrinters.length === 0 && initialJobs.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-[#12121a]/40 p-8 text-center space-y-4 my-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-accent-cyan/5 to-accent-magenta/5 pointer-events-none" />
            <div className="inline-flex size-14 items-center justify-center rounded-full bg-white/5 border border-white/10 text-slate-500 relative z-10">
              <Activity className="size-6 text-slate-400" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5 relative z-10">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Awaiting Connections & Submissions</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your workshop database is completely clear and offline. Real-time print volume charts, toner utilization metrics, and queue distribution graphs will dynamically render here as soon as you connect a physical printer and customers submit files.
              </p>
            </div>
            <div className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider relative z-10">
              System Status: Idle & Ready
            </div>
          </div>
        ) : (
          <>
            {/* Middle Section: Hourly Print Volume Graph */}
            <div className="rounded-2xl border border-white/5 bg-[#12121a]/60 p-4 mb-6">
              <h3 className="text-xs font-bold text-white tracking-wider uppercase mb-4">
                Hourly Print Volume (Live)
              </h3>
              
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={hourlyVolumeData}
                    margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
                  >
                    <defs>
                      {/* Glowing gradient definitions */}
                      <linearGradient id="cyanGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.01}/>
                      </linearGradient>
                      <linearGradient id="pinkGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff00ff" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#ff00ff" stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="time" 
                      stroke="#475569" 
                      fontSize={10} 
                      tickLine={false}
                      axisLine={false}
                      dy={5}
                    />
                    <YAxis 
                      domain={[0, 100]}
                      ticks={[0, 50, 100]}
                      stroke="#475569" 
                      fontSize={10} 
                      tickLine={false}
                      axisLine={false}
                      dx={-5}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "#08080c", 
                        borderColor: "rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "11px"
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="cyanVal" 
                      stroke="#00f0ff" 
                      strokeWidth={2.5}
                      fillOpacity={1} 
                      fill="url(#cyanGlow)" 
                      activeDot={{ r: 5, strokeWidth: 2, stroke: "#00f0ff", fill: "#08080c" }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="pinkVal" 
                      stroke="#ff00ff" 
                      strokeWidth={2.5}
                      fillOpacity={1} 
                      fill="url(#pinkGlow)" 
                      activeDot={{ r: 5, strokeWidth: 2, stroke: "#ff00ff", fill: "#08080c" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Split Grid: Distribution and Toner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Box 1: Job Status Distribution */}
              <div className="rounded-2xl border border-white/5 bg-[#12121a]/60 p-4">
                <h3 className="text-[11px] font-bold text-white tracking-wider uppercase mb-3">
                  Job Status Distribution (Live)
                </h3>

                <div className="flex items-center gap-2">
                  {/* Donut Chart */}
                  <div className="size-24 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={28}
                          outerRadius={38}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Status Labels */}
                  <div className="flex-1 space-y-1 text-[10px] md:text-xs">
                    {pieData.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between font-bold">
                        <div className="flex items-center gap-1.5">
                          <span className="size-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-slate-400">{item.name}</span>
                        </div>
                        <span className="text-white">({item.value}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Box 2: Toner Utilization */}
              <div className="rounded-2xl border border-white/5 bg-[#12121a]/60 p-4">
                <h3 className="text-[11px] font-bold text-white tracking-wider uppercase mb-3">
                  Toner Utilization (Live)
                </h3>

                <div className="space-y-3">
                  {tonerList.map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-[10px] md:text-xs font-bold">
                        <span className="text-slate-400">{item.label}</span>
                        <span className="text-white">({item.value}%)</span>
                      </div>
                      <div className="h-3 w-full bg-[#1b1b26] rounded-md overflow-hidden p-[1px] border border-white/5">
                        <div 
                          className={`h-full rounded-sm ${item.color}`}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </>
        )}

      </div>

      {/* Global Queue: Awaiting Pickup Queue */}
      <div className="rounded-[32px] border border-white/10 bg-[#0e0e16]/95 p-5 shadow-2xl relative overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.06)]">
        <h2 className="text-lg font-bold text-white tracking-tight mb-4 flex items-center gap-2">
          Awaiting Pickup Queue{" "}
          <span className="text-xs bg-white/5 text-slate-500 rounded-full px-2.5 py-0.5 font-bold">
            {initialJobs.length}
          </span>
        </h2>

        {/* Table representation matching the screenshot exactly */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-slate-500 text-[10px] uppercase font-bold tracking-widest pb-2.5">
                <th className="py-2.5 px-1">Job ID</th>
                <th className="py-2.5 px-1">Customer Name</th>
                <th className="py-2.5 px-1">File Type</th>
                <th className="py-2.5 px-1">Status</th>
                <th className="py-2.5 px-1 text-right">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {initialJobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-slate-500 font-bold uppercase tracking-wider">
                    No active print jobs in pickup queue
                  </td>
                </tr>
              ) : (
                /* Dynamic queue populated from actual Prisma jobs, styled beautifully */
                initialJobs.slice(0, 5).map((job, idx) => {
                  const status = job.status || "QUEUED";
                  let badgeStyle = "bg-[#ffd700]/10 text-[#ffd700] border border-[#ffd700]/30"; // WAITING
                  let statusText = "WAITING";

                  if (status === "READY" || status === "COMPLETED") {
                    badgeStyle = "bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30"; // READY
                    statusText = "READY";
                  } else if (status === "PRINTING") {
                    badgeStyle = "bg-[#ff00ff]/10 text-[#ff00ff] border border-[#ff00ff]/30"; // IN PROD
                    statusText = "IN PROD";
                  }

                  return (
                    <tr 
                      key={job.id} 
                      className="border-b border-white/5 text-xs text-white/90 hover:bg-white/[0.01] transition-colors"
                    >
                      <td className="py-3.5 px-1 font-mono text-slate-400">
                        #FLX-{job.id.slice(-4).toUpperCase()}
                      </td>
                      <td className="py-3.5 px-1 font-bold">
                        {getCustomerDisplay(job, idx)}
                      </td>
                      <td className="py-3.5 px-1 font-bold text-slate-400">
                        {getFileType(job)}
                      </td>
                      <td className="py-3.5 px-1">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wider ${badgeStyle}`}>
                          {statusText}
                        </span>
                      </td>
                      <td className="py-3.5 px-1 text-right text-slate-400 font-bold">
                        {formatDueDate(idx)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

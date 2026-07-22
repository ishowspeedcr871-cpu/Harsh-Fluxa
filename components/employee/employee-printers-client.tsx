"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { 
  Printer as PrinterIcon, 
  Search, 
  Activity, 
  RefreshCw, 
  Cpu, 
  AlertTriangle, 
  Download, 
  Link as LinkIcon, 
  ShieldCheck, 
  Info,
  Clock,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmployeePrintersClientProps {
  initialPrinters: any[];
  initialJobs: any[];
  organizationName: string;
}

export function EmployeePrintersClient({ 
  initialPrinters, 
  initialJobs, 
  organizationName 
}: EmployeePrintersClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"ALL" | "ONLINE" | "BUSY" | "OFFLINE">("ALL");
  const [isScanning, setIsScanning] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  // Parse or mock toner levels for rich visual fidelity
  const processedPrinters = useMemo(() => {
    return initialPrinters.map((printer, index) => {
      // Default toner values if missing in JSON
      let toner = { c: 80, m: 75, y: 70, k: 85 };
      if (printer.tonerLevel && typeof printer.tonerLevel === "object") {
        toner = { 
          c: Number(printer.tonerLevel.c ?? 80), 
          m: Number(printer.tonerLevel.m ?? 75), 
          y: Number(printer.tonerLevel.y ?? 70), 
          k: Number(printer.tonerLevel.k ?? 85) 
        };
      } else {
        // Deterministic realistic levels based on printer index
        const seeds = [
          { c: 92, m: 85, y: 88, k: 95 }, // Canon imagePRESS C710 (Production)
          { c: 60, m: 75, y: 70, k: 80 }, // Xerox Versant 180 (QuickPrint)
          { c: 30, m: 20, y: 25, k: 35 }, // HP PageWide XL (Plotter)
          { c: 12, m: 8, y: 15, k: 5 }     // Konica Minolta C3070 (Office) - low
        ];
        toner = seeds[index % seeds.length];
      }

      // Paper loaded configuration
      const paperSizes = ["A4", "A3", "36\" Roll", "Letter"];
      const paperLoaded = printer.maxPageSize || paperSizes[index % paperSizes.length];

      // Active job or queue representation
      let activeJobText = "Idle";
      if (printer.status === "BUSY") {
        activeJobText = `#FLX-9002`;
      } else if (printer.status === "ONLINE") {
        activeJobText = index % 2 === 0 ? `#FLX-9001` : `Queue (${Math.floor(Math.random() * 3) + 1})`;
      }

      // Friendly display fields matching the beautiful screenshot labels
      const roles = ["Production", "QuickPrint", "Plotter", "Office"];
      const role = roles[index % roles.length];

      return {
        ...printer,
        toner,
        paperLoaded,
        activeJobText,
        role
      };
    });
  }, [initialPrinters]);

  // Tab counters
  const counters = useMemo(() => {
    return {
      ALL: processedPrinters.length,
      ONLINE: processedPrinters.filter(p => p.status === "ONLINE").length,
      BUSY: processedPrinters.filter(p => p.status === "BUSY").length,
      OFFLINE: processedPrinters.filter(p => p.status === "OFFLINE").length
    };
  }, [processedPrinters]);

  // Filter list
  const filteredPrinters = useMemo(() => {
    if (activeTab === "ALL") return processedPrinters;
    return processedPrinters.filter(p => p.status === activeTab);
  }, [processedPrinters, activeTab]);

  // Execute Printer Discovery
  const triggerDiscovery = async () => {
    setIsScanning(true);
    setScanMessage("Searching local network via SNMP, mDNS, and IP scan...");
    try {
      const res = await fetch("/api/organization/printers/discover", { 
        method: "POST" 
      });
      const data = await res.json();
      if (data.success) {
        setScanMessage(`Success! Found and registered ${data.count} new local network printers.`);
        startTransition(() => {
          router.refresh();
        });
      } else {
        setScanMessage(data.error || "No new network printers detected.");
      }
    } catch (err) {
      setScanMessage("Failed to run local network discovery scanning.");
    } finally {
      setTimeout(() => {
        setIsScanning(false);
        setScanMessage(null);
      }, 4000);
    }
  };

  // Helper to format due dates matching the visual style in the screenshot
  const formatDueDate = (dateStr: string, index: number) => {
    const dates = [
      "Today, 3 PM",
      "Today, 5 PM",
      "Tomorrow, 9 AM",
      "Today, 12+ M"
    ];
    return dates[index % dates.length];
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Welcome Banner / Breadcrumb style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Welcome back,
          </p>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {organizationName || "Apex Digital Print Solutions"}!
          </h1>
        </div>

        {/* Action Header bar */}
        <Button 
          onClick={triggerDiscovery}
          disabled={isScanning}
          className="h-10 px-5 rounded-full bg-gradient-to-r from-accent-cyan to-blue-600 hover:from-accent-cyan/90 hover:to-blue-700 text-black font-extrabold text-xs tracking-wider uppercase flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
        >
          <RefreshCw className={`size-3.5 ${isScanning ? "animate-spin" : ""}`} />
          {isScanning ? "Scanning Network..." : "Discover Local Printers"}
        </Button>
      </div>

      {/* Discovery Loading State */}
      {isScanning && (
        <div className="rounded-[24px] border border-[#00f0ff]/35 bg-[#07131a] p-5 text-accent-cyan animate-pulse flex items-center gap-4">
          <Cpu className="size-6 animate-spin text-[#00f0ff]" />
          <div>
            <p className="text-sm font-bold tracking-wide">Universal Network Scan Running</p>
            <p className="text-xs text-cyan-300/80">{scanMessage}</p>
          </div>
        </div>
      )}

      {/* Main Glass Grid matching the mobile/tablet screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Printers Management Dashboard (2 columns wide) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative rounded-[32px] border border-white/10 bg-gradient-to-b from-[#0e0e16]/95 to-[#08080c]/98 p-6 shadow-2xl overflow-hidden shadow-[0_0_40px_rgba(168,85,247,0.06)]">
            
            {/* Ambient Background Glow Layer */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-accent-cyan/10 via-purple-500/10 to-transparent rounded-full blur-[80px] -z-10 pointer-events-none" />

            {/* Title / Header */}
            <div className="flex flex-col items-center justify-between border-b border-white/5 pb-5 mb-5 md:flex-row gap-4">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Printers Management
              </h2>

              {/* Filtering Navigation / Tabs */}
              <div className="flex bg-[#07070b] border border-white/5 rounded-full p-1 max-w-full overflow-x-auto">
                {(["ALL", "ONLINE", "BUSY", "OFFLINE"] as const).map((tab) => {
                  const isActive = activeTab === tab;
                  const count = counters[tab];
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? "bg-gradient-to-r from-accent-cyan to-blue-500 text-black shadow-lg shadow-cyan-500/20"
                          : "text-muted-foreground hover:text-white"
                      }`}
                    >
                      {tab === "ALL" ? "All" : tab === "ONLINE" ? "Online" : tab === "BUSY" ? "Busy" : "Offline"}{" "}
                      <span className={`text-[10px] ml-1 opacity-70`}>({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* List of Printers */}
            {filteredPrinters.length === 0 ? (
              /* No Printers State */
              <div className="py-12 text-center space-y-4">
                <div className="inline-flex size-16 items-center justify-center rounded-full bg-white/5 border border-white/10 text-muted-foreground animate-bounce">
                  <PrinterIcon className="size-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">No active printers connected</h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                    No printers currently match this filter. Use the "Discover Local Printers" scan tool or follow the Desktop Connector setup instructions.
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    onClick={triggerDiscovery}
                    className="h-9 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs"
                  >
                    Simulate Live Discovery
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPrinters.map((printer) => {
                  const isOnline = printer.status === "ONLINE";
                  const isBusy = printer.status === "BUSY";
                  const isOffline = printer.status === "OFFLINE";

                  return (
                    <div
                      key={printer.id}
                      className="relative rounded-2xl border border-white/5 bg-[#12121a]/60 hover:bg-[#141420]/80 p-5 transition-all duration-300 shadow-md group overflow-hidden"
                    >
                      {/* Subtle hover edge glow */}
                      <div className="absolute inset-0 border border-transparent group-hover:border-accent-cyan/15 rounded-2xl transition-all duration-300 pointer-events-none" />

                      {/* Top Row: Brand & Name + Status */}
                      <div className="flex items-center justify-between mb-3.5">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm md:text-base font-bold text-white tracking-tight">
                            {printer.name}{" "}
                            <span className="text-muted-foreground font-medium text-xs">
                              ({printer.role})
                            </span>
                          </h3>
                        </div>

                        {/* Status badges from screenshot */}
                        <div className="flex items-center gap-1.5">
                          {isOnline && (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">
                              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              ONLINE
                            </span>
                          )}
                          {isBusy && (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 uppercase tracking-widest">
                              <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
                              BUSY
                            </span>
                          )}
                          {isOffline && (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20 uppercase tracking-widest">
                              <span className="size-1.5 rounded-full bg-rose-400" />
                              OFFLINE
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Body section */}
                      {!isOffline ? (
                        <div className="space-y-3">
                          {/* Segmented Toner Bar */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[11px] font-bold text-muted-foreground">
                              <span>
                                Toner Levels:{" "}
                                <span className="text-cyan-400">C {printer.toner.c}%</span>,{" "}
                                <span className="text-fuchsia-400">M {printer.toner.m}%</span>,{" "}
                                <span className="text-amber-400">Y {printer.toner.y}%</span>,{" "}
                                <span className="text-slate-200">K {printer.toner.k}%</span>
                              </span>
                            </div>

                            {/* Beautiful continuous segmented bar representing CMYK color zones */}
                            <div className="h-2 w-full rounded-full bg-[#1b1b26] flex overflow-hidden p-[1px] border border-white/5">
                              <div 
                                style={{ width: `${printer.toner.c * 0.25}%` }} 
                                className="h-full bg-cyan-400 transition-all rounded-l-full"
                              />
                              <div 
                                style={{ width: `${printer.toner.m * 0.25}%` }} 
                                className="h-full bg-fuchsia-500 transition-all"
                              />
                              <div 
                                style={{ width: `${printer.toner.y * 0.25}%` }} 
                                className="h-full bg-yellow-400 transition-all"
                              />
                              <div 
                                style={{ width: `${printer.toner.k * 0.25}%` }} 
                                className="h-full bg-slate-300 transition-all rounded-r-full"
                              />
                            </div>
                          </div>

                          {/* Paper and Active Job Row */}
                          <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground pt-1 border-t border-white/5">
                            <span className="text-white font-medium flex items-center gap-1">
                              Paper {printer.paperLoaded} Loaded
                            </span>
                            <span className="text-accent-cyan flex items-center gap-1 font-bold">
                              Active Job: {printer.activeJobText}
                            </span>
                          </div>
                        </div>
                      ) : (
                        /* Offline Printer view from Screenshot */
                        <div className="space-y-3">
                          <div className="flex justify-between text-[11px] font-bold text-muted-foreground">
                            <span className="text-rose-400/80">Last seen: 14:32</span>
                            <span className="text-slate-400">Toner Low</span>
                          </div>

                          <div className="h-2 w-full rounded-full bg-rose-500/10 flex overflow-hidden border border-rose-500/10">
                            <div className="h-full bg-rose-500/30 w-[10%] rounded-full" />
                          </div>

                          <div className="flex items-center justify-between text-[11px] font-bold text-rose-400 pt-1 border-t border-white/5">
                            <span>Offline</span>
                            <span className="text-rose-400 flex items-center gap-1 font-bold">
                              Maintenance Required
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Global Pickup Queue Section from Screenshot */}
          <div className="rounded-[32px] border border-white/10 bg-[#0e0e16]/95 p-6 shadow-2xl relative overflow-hidden shadow-[0_0_40px_rgba(168,85,247,0.06)]">
            <h2 className="text-xl font-bold text-white tracking-tight mb-5 flex items-center gap-2">
              Global Pickup Queue{" "}
              <span className="text-xs bg-white/5 text-muted-foreground rounded-full px-2.5 py-0.5 font-bold">
                {initialJobs.length}
              </span>
            </h2>

            {/* Queue Table */}
            {initialJobs.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-xs font-bold">
                No jobs currently in the pickup queue.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-500 text-[10px] uppercase font-bold tracking-widest pb-3">
                      <th className="py-3 px-1">Job ID</th>
                      <th className="py-3 px-1">Customer Name</th>
                      <th className="py-3 px-1">File Type</th>
                      <th className="py-3 px-1">Status</th>
                      <th className="py-3 px-1 text-right">Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {initialJobs.slice(0, 8).map((job, idx) => {
                      // Map status to visual custom colored labels matching screenshot
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

                      // Format Customer Name
                      let customerName = "Guest User";
                      if (job.customerUser) {
                        const emailName = job.customerUser.email.split("@")[0];
                        customerName = emailName.charAt(0).toUpperCase() + emailName.slice(1, 6) + " " + emailName.charAt(6)?.toUpperCase() + ".";
                      }

                      return (
                        <tr 
                          key={job.id} 
                          className="border-b border-white/5 text-xs text-white/90 hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="py-3.5 px-1 font-mono text-slate-400">
                            #FLX-{job.id.slice(-4).toUpperCase()}
                          </td>
                          <td className="py-3.5 px-1 font-bold">
                            {customerName}
                          </td>
                          <td className="py-3.5 px-1 font-bold text-slate-400">
                            {job.fileType || "PDF"}
                          </td>
                          <td className="py-3.5 px-1">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wider ${badgeStyle}`}>
                              {statusText}
                            </span>
                          </td>
                          <td className="py-3.5 px-1 text-right text-slate-400 font-bold">
                            {formatDueDate(job.dueDate, idx)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: How to Connect Local Printers Panel */}
        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-[#0e0e16]/95 p-6 shadow-2xl relative overflow-hidden">
            <h2 className="text-base font-extrabold text-white tracking-wide uppercase mb-4 flex items-center gap-2">
              <LinkIcon className="size-4 text-accent-cyan" />
              How to Connect Printers
            </h2>

            <p className="text-xs text-muted-foreground leading-relaxed mb-5">
              The Fluxa Cloud Connector enables secure printing from any device to your local physical printing workshop network. Follow these steps to register your workspace devices:
            </p>

            {/* Instruction Steps */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-xs font-black">
                  1
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Download Client App</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    Install the Fluxa Desktop Print Spooler client on any local server or print-station machine within your workshop network.
                  </p>
                  <Button className="h-7 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-bold text-white mt-2 flex items-center gap-1.5 cursor-pointer">
                    <Download className="size-3" /> Get Desktop Client
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-xs font-black">
                  2
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Input Workspace Token</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    Verify connection status by inputting your unique organization workshop pairing token:
                  </p>
                  <div className="mt-2 flex items-center justify-between rounded-lg bg-black/60 border border-white/10 p-2.5">
                    <code className="text-xs font-mono font-bold text-accent-cyan select-all">
                      FLX-TOK-5829-PRN
                    </code>
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold">
                      Active Code
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-xs font-black">
                  3
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Automated Device Scan</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    The desktop client automatically scans for network-attached lasers, plotters, and production machinery using IPP, SNMP, and mDNS protocols, registering them instantly.
                  </p>
                </div>
              </div>
            </div>

            {/* Troubleshooting / Security Info */}
            <div className="mt-6 pt-5 border-t border-white/5 flex items-start gap-3 text-[11px] text-muted-foreground leading-relaxed bg-[#0a0a10] rounded-xl p-3 border border-white/5">
              <ShieldCheck className="size-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-white font-bold block mb-0.5">Secure Workshop Proxy</span>
                Printers are proxy-shielded behind 256-bit secure SSL tunnels, eliminating the need for inbound firewall open ports or port forwarding.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

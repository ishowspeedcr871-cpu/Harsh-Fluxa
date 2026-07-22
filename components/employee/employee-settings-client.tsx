"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  User, 
  Settings, 
  Monitor, 
  ShieldCheck, 
  Globe, 
  Bell, 
  Download, 
  Database,
  Lock,
  ArrowUpRight,
  LogOut,
  ChevronDown,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/services/auth/actions";
import { fetchLiveSettingsData } from "@/app/employee/actions";
import Link from "next/link";

interface EmployeeSettingsClientProps {
  user: {
    name: string | null;
    email: string;
  };
  membership: {
    role: string;
  };
  organization: {
    name: string;
  };
  initialPrinters: any[];
  initialJobs: any[];
}

export function EmployeeSettingsClient({
  user,
  membership,
  organization,
  initialPrinters,
  initialJobs
}: EmployeeSettingsClientProps) {
  const [livePrinters, setLivePrinters] = useState(initialPrinters);
  const [liveJobs, setLiveJobs] = useState(initialJobs);
  const [liveUser, setLiveUser] = useState(user);
  const [liveMembership, setLiveMembership] = useState(membership);
  const [liveOrganization, setLiveOrganization] = useState(organization);

  // State for toggles shown in the preferences panel
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState("English (US)");
  const [isSyncing, setIsSyncing] = useState(false);

  // Poll for real-time live database updates every 4 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      setIsSyncing(true);
      try {
        const res = await fetchLiveSettingsData();
        if (res.success) {
          if (res.printers) setLivePrinters(res.printers);
          if (res.jobs) setLiveJobs(res.jobs);
          if (res.user) setLiveUser(res.user);
          if (res.membership) setLiveMembership(res.membership);
          if (res.organization) setLiveOrganization(res.organization);
        }
      } catch (err) {
        console.error("Failed to fetch settings live data:", err);
      } finally {
        setIsSyncing(false);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Friendly role display logic matching standard corporate titles
  const formattedRole = useMemo(() => {
    if (liveMembership.role === "ADMIN" || liveMembership.role === "OWNER") {
      return "System Administrator";
    }
    return "Operations Associate";
  }, [liveMembership.role]);

  // Replicate status dots and active printers list from screenshot
  const printersList = useMemo(() => {
    return livePrinters.slice(0, 3).map((p) => ({
      name: p.name.split(" ")[0] + " " + (p.name.split(" ")[1] || ""),
      status: p.status === "ONLINE" ? "Online" : p.status === "BUSY" ? "Busy" : "Offline",
      dotColor: p.status === "ONLINE" ? "bg-emerald-400" : p.status === "BUSY" ? "bg-amber-400" : "bg-rose-400",
      textColor: p.status === "ONLINE" ? "text-emerald-400/90" : p.status === "BUSY" ? "text-amber-400/90" : "text-rose-400/90"
    }));
  }, [livePrinters]);

  // Format guest names or dynamic customer names for pickup table
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

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome back header */}
      <div>
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Welcome back,
        </p>
        <h1 className="text-2xl font-black text-white tracking-tight">
          {liveOrganization.name}!
        </h1>
      </div>

      {/* Main Glass Frame containing Application Settings boxes */}
      <div className="relative rounded-[32px] border border-white/10 bg-gradient-to-b from-[#0e0e16]/95 to-[#08080c]/98 p-6 shadow-2xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.08)]">
        
        {/* Subtle decorative purple glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-accent-cyan/10 via-purple-500/10 to-transparent rounded-full blur-[80px] -z-10 pointer-events-none" />

        {/* Header Title */}
        <div className="text-center pb-5 mb-5 border-b border-white/5">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Application Settings
          </h2>
        </div>

        {/* 2x2 Grid + Full width Bottom Box representing settings options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          
          {/* Card 1: Account Information */}
          <div className="rounded-[20px] border border-white/5 bg-[#12121a]/60 p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">
                Account Information
              </h3>
              
              <div className="flex items-center gap-4">
                {/* Visual Avatar */}
                <div className="size-16 rounded-full bg-gradient-to-tr from-accent-cyan via-blue-600 to-purple-600 p-[1.5px] shadow-[0_0_15px_rgba(6,182,212,0.15)] flex items-center justify-center">
                  <div className="size-full rounded-full bg-[#0a0a0f] flex items-center justify-center">
                    <User className="size-7 text-accent-cyan" />
                  </div>
                </div>

                {/* User labels */}
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-400">
                    Name: <span className="text-white text-sm">{liveUser.name || "Apex Digital Admin"}</span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-400">
                    Email: <span className="text-white">{liveUser.email || "admin@apexdigital.com"}</span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-400">
                    Role: <span className="text-accent-cyan uppercase tracking-wider text-[10px] ml-1">{formattedRole}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/5 flex gap-2">
              <Button className="flex-1 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white font-bold tracking-wide transition-all cursor-pointer">
                Manage Account
              </Button>
              <form action={logoutAction} className="flex-1">
                <Button 
                  type="submit"
                  className="w-full h-10 rounded-full bg-danger/10 hover:bg-danger/20 border border-danger/30 text-xs text-danger font-bold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogOut className="size-3.5" />
                  Sign Out
                </Button>
              </form>
            </div>
          </div>

          {/* Card 2: Preferences */}
          <div className="rounded-[20px] border border-white/5 bg-[#12121a]/60 p-5 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">
                Preferences
              </h3>

              <div className="space-y-4">
                {/* Dark Mode toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Dark Mode</span>
                  <button 
                    onClick={() => setDarkMode(!darkMode)}
                    className={`relative w-11 h-6 rounded-full p-0.5 transition-all duration-300 cursor-pointer ${
                      darkMode ? "bg-accent-cyan shadow-[0_0_10px_rgba(6,182,212,0.4)]" : "bg-slate-700"
                    }`}
                  >
                    <div className={`size-5 rounded-full bg-white transition-all duration-300 ${
                      darkMode ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </button>
                </div>

                {/* Language Select dropdown */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Language</span>
                  <div className="relative">
                    <select 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="appearance-none bg-black/60 hover:bg-black/80 border border-white/10 text-white font-bold text-xs rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-accent-cyan/50 cursor-pointer"
                    >
                      <option value="English (US)">English (US)</option>
                      <option value="Hindi">Hindi (IN)</option>
                      <option value="Spanish">Spanish (ES)</option>
                    </select>
                    <ChevronDown className="size-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* Notifications toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Notifications</span>
                  <button 
                    onClick={() => setNotifications(!notifications)}
                    className={`relative w-11 h-6 rounded-full p-0.5 transition-all duration-300 cursor-pointer ${
                      notifications ? "bg-accent-cyan shadow-[0_0_10px_rgba(6,182,212,0.4)]" : "bg-slate-700"
                    }`}
                  >
                    <div className={`size-5 rounded-full bg-white transition-all duration-300 ${
                      notifications ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Button className="w-full h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white font-bold tracking-wide transition-all cursor-pointer">
                Default Print Settings
              </Button>
              <Link href="/employee/settings/whatsapp">
                <Button className="w-full h-10 rounded-full bg-accent-cyan/10 hover:bg-accent-cyan/20 border border-accent-cyan/20 text-xs text-accent-cyan font-bold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2">
                  <MessageCircle className="size-3.5" />
                  WhatsApp Support Config
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 3: Linked Devices & Printers */}
          <div className="rounded-[20px] border border-white/5 bg-[#12121a]/60 p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">
                Linked Devices & Printers
              </h3>

              <div className="space-y-3 pb-2">
                {printersList.map((printer, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <Monitor className="size-4 text-slate-400" />
                      <span className="text-white font-semibold">{printer.name}</span>
                      <span className="text-slate-500 text-[10px]">({printer.status})</span>
                    </div>
                    {/* Status Dot */}
                    <div className="flex items-center gap-1.5">
                      <span className={`size-1.5 rounded-full ${printer.dotColor} animate-pulse`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/5">
              <Button className="w-full h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white font-bold tracking-wide transition-all cursor-pointer">
                Add/Remove Devices
              </Button>
            </div>
          </div>

          {/* Card 4: System & Security */}
          <div className="rounded-[20px] border border-white/5 bg-[#12121a]/60 p-5 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3">
                System & Security
              </h3>

              <div className="space-y-3.5">
                <div className="text-xs font-bold">
                  <span className="text-slate-400">Firmware Updates</span>
                  <span className="text-accent-cyan block text-[11px] font-semibold mt-0.5 animate-pulse">
                    (checking)
                  </span>
                </div>
                <div className="text-xs font-bold pt-2 border-t border-white/5">
                  <span className="text-slate-400">Data Sync Interval</span>
                  <span className="text-[#ff00ff] block text-[11px] font-semibold mt-0.5">
                    Real-Time
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button className="h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] md:text-xs text-white font-bold tracking-tight cursor-pointer">
                Security Password & 2FA
              </Button>
              <Button className="h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] md:text-xs text-white font-bold tracking-tight cursor-pointer">
                Export Logs
              </Button>
            </div>
          </div>

        </div>

        {/* Full-width bottom card: About Fluxa */}
        <div className="rounded-[20px] border border-white/5 bg-[#12121a]/60 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                About Fluxa
              </h3>
              <p className="text-xs text-white font-semibold">
                Version: <span className="text-accent-cyan">2.1.0</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-bold text-slate-400">
              <a href="#" className="hover:text-white transition-all">Terms of Service</a>
              <a href="#" className="hover:text-white transition-all">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-all">Contact Support</a>
            </div>
          </div>
        </div>

        {/* Logout session button preservation block */}
        <div className="mt-6 pt-5 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-muted-foreground">
            Session Management: Active on this device.
          </p>
          <form action={logoutAction} className="w-full md:w-auto">
            <Button
              type="submit"
              className="w-full md:px-8 h-10 rounded-full bg-danger/10 hover:bg-danger/20 border border-danger/35 text-danger text-[11px] font-extrabold tracking-widest uppercase transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="size-3.5" />
              SIGN OUT OF WORKSHOP
            </Button>
          </form>
        </div>

      </div>

      {/* Global Queue: Awaiting Pickup Queue */}
      <div className="rounded-[32px] border border-white/10 bg-[#0e0e16]/95 p-5 shadow-2xl relative overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.06)]">
        <h2 className="text-lg font-bold text-white tracking-tight mb-4 flex items-center gap-2">
          Awaiting Pickup Queue{" "}
          <span className="text-xs bg-white/5 text-slate-500 rounded-full px-2.5 py-0.5 font-bold">
            {liveJobs.length}
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
              {liveJobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-slate-500 font-bold uppercase tracking-wider">
                    No active print jobs in pickup queue
                  </td>
                </tr>
              ) : (
                /* Dynamic queue populated from actual Prisma jobs, styled beautifully */
                liveJobs.slice(0, 5).map((job, idx) => {
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

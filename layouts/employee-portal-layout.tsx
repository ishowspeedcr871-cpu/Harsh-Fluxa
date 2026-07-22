"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutGrid,
  Printer,
  BarChart3,
  Settings,
  User,
  MessageCircle,
  LogOut
} from "lucide-react";
import { logoutAction } from "@/services/auth/actions";
import { NotificationBell } from "@/components/notifications/notification-bell";

interface EmployeePortalLayoutProps {
  children: React.ReactNode;
}

export function EmployeePortalLayout({ children }: EmployeePortalLayoutProps) {
  const pathname = usePathname() || "";
  const router = useRouter();

  // Determine current navigation tab based on path
  const currentNav = useMemo(() => {
    if (pathname.includes("/printers")) return "printers";
    if (pathname.includes("/analytics")) return "analytics";
    if (pathname.includes("/settings/whatsapp")) return "whatsapp";
    if (pathname.includes("/settings")) return "settings";
    return "dashboard";
  }, [pathname]);

  const navItems = [
    { id: "dashboard", label: "Queue", path: "/employee", icon: LayoutGrid },
    { id: "printers", label: "Printers", path: "/employee/printers", icon: Printer },
    { id: "analytics", label: "Analytics", path: "/employee/analytics", icon: BarChart3 },
    { id: "whatsapp", label: "WhatsApp", path: "/employee/settings/whatsapp", icon: MessageCircle },
    { id: "settings", label: "Settings", path: "/employee/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center p-0 md:p-6 select-none relative overflow-x-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-accent-cyan/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-accent-magenta/5 blur-[120px] pointer-events-none" />

      {/* Main Container: Mobile style on mobile, Wide Framed Dashboard on Desktop & Tablets */}
      <div className="w-full max-w-md md:max-w-6xl xl:max-w-7xl md:h-[840px] lg:h-[880px] h-screen md:rounded-[32px] md:border md:border-white/10 bg-black flex flex-col md:flex-row relative overflow-hidden shadow-2xl shadow-accent-cyan/10">
        
        {/* DESKTOP SIDEBAR (Visible on md and above) */}
        <aside className="hidden md:flex flex-col w-64 border-r border-white/10 bg-[#08080c] p-6 z-40 shrink-0">
          <div className="mb-8">
            <Link href="/employee" className="flex items-center gap-1.5 focus:outline-none">
              <span className="text-2xl font-black tracking-[0.15em] text-accent-cyan font-sans drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">
                FLUXA
              </span>
            </Link>
            <div className="mt-6 p-3 bg-white/5 border border-white/10 rounded-xl">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Workspace</h3>
              <h2 className="text-xs font-bold text-white truncate mt-0.5">Apex Digital Print</h2>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentNav === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 relative ${
                    isActive 
                      ? "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 shadow-[0_0_15px_rgba(0,255,255,0.05)]" 
                      : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Icon className={`size-4 ${isActive ? "text-accent-cyan" : "text-slate-400"}`} />
                  {item.label}
                  {isActive && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="absolute right-3 w-1.5 h-1.5 rounded-full bg-accent-cyan shadow-[0_0_8px_rgba(0,255,255,0.8)]"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom user widget */}
          <div className="mt-auto pt-6 border-t border-white/5">
            <div className="flex items-center gap-3 mb-4 group relative">
              <Link href="/employee/profile" className="size-10 rounded-full border border-accent-cyan/50 bg-accent-cyan/10 flex items-center justify-center text-accent-cyan transition-all group-hover:shadow-[0_0_15px_rgba(0,255,255,0.2)]">
                <User className="size-5" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link href="/employee/profile">
                  <h4 className="text-xs font-bold text-white truncate hover:text-accent-cyan transition-colors cursor-pointer">Apex Staff</h4>
                </Link>
                <p className="text-[10px] text-slate-400 font-medium truncate">fluxa1409@gmail.com</p>
              </div>
              
              <form action={logoutAction} className="opacity-0 group-hover:opacity-100 transition-opacity">
                <button type="submit" className="p-2 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-all" title="Sign Out">
                  <LogOut className="size-3.5" />
                </button>
              </form>
            </div>

            <div className="flex bg-white/5 border border-white/10 rounded-full p-1 w-full justify-between">
              <Link href="/employee" className="flex-1 text-center py-1.5 bg-white/10 rounded-full text-[10px] font-bold text-accent-cyan">
                Home
              </Link>
              <form action={logoutAction} className="flex-1">
                <button type="submit" className="w-full text-center py-1.5 text-[10px] font-bold text-muted-foreground hover:text-danger transition-colors uppercase">
                  Log Out
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* MOBILE HEADER (Visible below md) */}
        <header className="md:hidden px-5 pt-6 pb-4 flex flex-col z-40 bg-black/40 border-b border-white/5">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Welcome back,</h3>
            <h2 className="text-sm font-bold text-white">Apex Digital Print Solutions!</h2>
          </div>
          
          <div className="flex items-center justify-between">
            <Link href="/employee" className="flex items-center gap-1.5 focus:outline-none">
              <span className="text-[22px] font-black tracking-[0.12em] text-accent-cyan font-sans">
                FLUXA
              </span>
            </Link>

            <div className="flex bg-white/5 border border-white/10 rounded-full p-1">
              <Link href="/employee" className="px-4 py-1.5 bg-white/10 rounded-full text-xs font-semibold text-accent-cyan">
                Home
              </Link>
              <Link href="/employee/rewards" className="px-4 py-1.5 text-xs font-semibold text-muted-foreground hover:text-white transition-colors">
                Rewards
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/employee/profile" className="size-9 rounded-full border border-accent-cyan/50 bg-accent-cyan/10 flex items-center justify-center text-accent-cyan">
                <User className="size-4" />
              </Link>
              <NotificationBell portalType="employee" />
              <form action={logoutAction}>
                <button type="submit" className="size-9 rounded-full border border-danger/30 bg-danger/10 flex items-center justify-center text-danger">
                  <LogOut className="size-4" />
                </button>
              </form>
            </div>
          </div>
        </header>

        {/* DESKTOP ROUTE HEADER (Visible on md and above inside main panel) */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <header className="hidden md:flex items-center justify-between px-8 py-5 border-b border-white/10 bg-[#08080c]/40 backdrop-blur-md z-30 shrink-0">
            <div>
              <h1 className="text-lg font-black tracking-wider uppercase text-white">
                {navItems.find(item => item.id === currentNav)?.label || "Dashboard"}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Apex Digital Workshop Portal</p>
            </div>

            <div className="flex items-center gap-4">
              <NotificationBell portalType="employee" />
              <div className="h-6 w-px bg-white/10" />
              <div className="text-right">
                <h4 className="text-xs font-bold text-white">Apex Digital Staff</h4>
                <p className="text-[10px] text-accent-cyan font-semibold uppercase tracking-wider">Live Connection</p>
              </div>
            </div>
          </header>

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-24 md:pb-8 space-y-6 scrollbar-none scroll-smooth">
            {children}
          </main>
        </div>

        {/* MOBILE STICKY BOTTOM NAV (Visible below md) */}
        <nav className="md:hidden absolute bottom-0 left-0 right-0 h-20 bg-black/90 backdrop-blur-md border-t border-white/10 flex items-center justify-around px-2 z-50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentNav === item.id;
            return (
              <Link 
                key={item.id}
                href={item.path} 
                className={`flex flex-col items-center gap-1.5 py-1 px-3 ${
                  isActive ? "text-accent-cyan" : "text-muted-foreground hover:text-white"
                }`}
              >
                <Icon className="size-5" />
                <span className="text-[10px] font-semibold tracking-wider">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <style jsx global>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

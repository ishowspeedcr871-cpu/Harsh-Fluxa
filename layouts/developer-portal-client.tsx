"use client";

import { DeveloperNavigation } from "@/components/developer/developer-navigation";
import { PremiumAnimatedBackground } from "@/components/ui/premium-animated-background";
import { Search, Menu, LayoutGrid, Users, ShieldCheck, BarChart3, Settings as SettingsIcon, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/notifications/notification-bell";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function DeveloperPortalClient({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <PremiumAnimatedBackground />
      <div className="relative flex min-h-screen text-white selection:bg-accent-cyan/30">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <DeveloperNavigation />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-[#020203] transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <span className="text-xl font-black tracking-[0.2em] text-accent-cyan">FLUXΛ</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg bg-white/5 p-2">
                <X className="size-5 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <DeveloperNavigation />
            </div>
          </div>
        </div>
        
        <div className="flex-1 lg:pl-64">
          {/* Header */}
          <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-white/5 bg-[#020203]/90 px-4 md:px-6 backdrop-blur-sm">
            <div className="flex items-center gap-4 md:gap-8 flex-1">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden rounded-xl border border-white/10 bg-white/5 p-2.5 hover:bg-white/10 transition-colors"
                >
                  <Menu className="size-6 text-white" />
                </button>
                <div className="flex items-center lg:hidden">
                  <span className="text-xl font-black tracking-[0.2em] text-accent-cyan">FLUXΛ</span>
                </div>
              </div>
              
              <div className="relative hidden max-w-md flex-1 md:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search anything..." 
                  className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 text-sm outline-none focus:border-accent-cyan/50 focus:bg-white/[0.08] transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-5">
              <NotificationBell portalType="developer" />
              
              <div className="flex items-center gap-3 pl-2">
                <p className="hidden text-right md:block">
                  <span className="block text-[11px] font-bold text-muted-foreground uppercase tracking-tighter">Welcome back,</span>
                  <span className="block text-xs font-black text-white">Master Developer!</span>
                </p>
                <div className="rounded-full border-2 border-accent-cyan p-0.5 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                  <Avatar className="size-8 md:size-9" name="Master Developer" />
                </div>
              </div>
            </div>
          </header>

          <main className="p-4 md:p-6 lg:p-10">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>

          {/* Bottom Nav for Mobile */}
          <div className="fixed bottom-0 left-0 z-50 flex w-full border-t border-white/5 bg-[#020203]/95 px-4 py-3 backdrop-blur-sm lg:hidden">
            <div className="flex w-full items-center justify-between">
              <Link href="/developer" className={`flex flex-col items-center gap-1 ${pathname === '/developer' ? 'text-accent-cyan' : 'text-muted-foreground'}`}>
                <LayoutGrid className="size-5" />
                <span className="text-[9px] font-bold uppercase">Dashboard</span>
              </Link>
              <Link href="/developer/users" className={`flex flex-col items-center gap-1 ${pathname.startsWith('/developer/users') ? 'text-accent-cyan' : 'text-muted-foreground'}`}>
                <Users className="size-5" />
                <span className="text-[9px] font-bold uppercase">Users</span>
              </Link>
              <Link href="/developer/organizations" className={`flex flex-col items-center gap-1 ${pathname.startsWith('/developer/organizations') ? 'text-accent-cyan' : 'text-muted-foreground'}`}>
                <ShieldCheck className="size-5" />
                <span className="text-[9px] font-bold uppercase">Orgs</span>
              </Link>
              <Link href="/developer/analytics" className={`flex flex-col items-center gap-1 ${pathname.startsWith('/developer/analytics') ? 'text-accent-cyan' : 'text-muted-foreground'}`}>
                <BarChart3 className="size-5" />
                <span className="text-[9px] font-bold uppercase">Analytics</span>
              </Link>
              <Link href="/developer/settings" className={`flex flex-col items-center gap-1 ${pathname.startsWith('/developer/settings') ? 'text-accent-cyan' : 'text-muted-foreground'}`}>
                <SettingsIcon className="size-5" />
                <span className="text-[9px] font-bold uppercase">Settings</span>
              </Link>
            </div>
          </div>

          {/* Footer */}
          <footer className="border-t border-white/5 p-8 text-center pb-24 lg:pb-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              © 2025 <span className="text-white">FLUXA</span>. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}

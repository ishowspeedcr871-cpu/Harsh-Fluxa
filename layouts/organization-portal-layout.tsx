"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  Clock,
  Settings,
  User,
  Printer,
  ShieldCheck,
  Users,
  Menu,
  X,
  KeyRound
} from "lucide-react";
import { PremiumAnimatedBackground } from "@/components/ui/premium-animated-background";
import { NotificationBell } from "@/components/notifications/notification-bell";

interface OrganizationPortalLayoutProps {
  children: React.ReactNode;
  userEmail?: string;
  organizationName?: string;
}

export function OrganizationPortalLayout({ 
  children, 
  userEmail = "admin@fluxa.com",
  organizationName = "Fluxa HQ"
}: OrganizationPortalLayoutProps) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Determine current bottom navigation tab based on path
  const currentNav = useMemo(() => {
    if (pathname.includes("/members")) return "members";
    if (pathname.includes("/settings")) return "settings";
    if (pathname.includes("/printers")) return "printers";
    return "dashboard";
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center p-0 md:p-6 select-none relative overflow-x-hidden font-sans">
      <PremiumAnimatedBackground />

      {/* Styled Responsive Device Shell */}
      <div className="w-full max-w-md md:h-[880px] h-screen md:rounded-[40px] md:border md:border-white/10 bg-black/40 backdrop-blur-sm flex flex-col relative overflow-hidden shadow-2xl shadow-accent-cyan/10">
        
        {/* TOP STATUS HEADER BAR */}
        <header className="px-5 pt-6 pb-4 bg-black/60 backdrop-blur-md flex items-center justify-between z-40 border-b border-white/5 sticky top-0">
          {/* Logo */}
          <Link href="/organization" className="flex flex-col items-start focus:outline-none">
            <span className="text-[20px] font-black tracking-[0.2em] text-accent-cyan leading-none">
              FLUXΛ
            </span>
            <span className="text-[9px] font-bold tracking-[0.3em] text-muted-foreground uppercase mt-1">
              {organizationName}
            </span>
          </Link>

          {/* Action Area */}
          <div className="flex items-center gap-3">
            <NotificationBell portalType="employee" />
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative flex items-center justify-center size-9 rounded-full border border-white/10 bg-black/40 hover:bg-white/10 transition-all duration-300"
            >
              {isMenuOpen ? <X className="size-4 text-white" /> : <Menu className="size-4 text-white" />}
            </button>

            <Link
              href="/profile"
              className="relative flex items-center justify-center size-9 rounded-full border border-accent-magenta/40 bg-black/40 hover:border-accent-magenta transition-all duration-300 overflow-hidden"
            >
              <User className="size-4 text-accent-magenta" />
            </Link>
          </div>
        </header>

        {/* SIDE MENU OVERLAY */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="absolute inset-0 z-50 bg-[#050508]/95 backdrop-blur-xl p-8 pt-24"
            >
              <nav className="flex flex-col gap-6">
                <Link 
                  href="/organization" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-4 text-xl font-bold hover:text-accent-cyan transition-colors"
                >
                  <LayoutGrid className="size-6 text-accent-cyan" />
                  Dashboard
                </Link>
                <Link 
                  href="/organization/members" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-4 text-xl font-bold hover:text-accent-cyan transition-colors"
                >
                  <Users className="size-6 text-accent-magenta" />
                  Employees
                </Link>
                <Link 
                  href="/employee/customers" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-4 text-xl font-bold hover:text-accent-cyan transition-colors"
                >
                  <User className="size-6 text-accent-cyan" />
                  Customers
                </Link>
                <Link 
                  href="/employee/queue" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-4 text-xl font-bold hover:text-accent-cyan transition-colors"
                >
                  <LayoutGrid className="size-6 text-accent-magenta" />
                  Orders
                </Link>
                <Link 
                  href="/printers" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-4 text-xl font-bold hover:text-accent-cyan transition-colors"
                >
                  <Printer className="size-6 text-accent-cyan" />
                  Printers
                </Link>
                <Link 
                  href="/organization/intelligence" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-4 text-xl font-bold hover:text-accent-cyan transition-colors"
                >
                  <ShieldCheck className="size-6 text-accent-magenta" />
                  Security
                </Link>
                <Link 
                  href="/organization/settings" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-4 text-xl font-bold hover:text-accent-cyan transition-colors"
                >
                  <Settings className="size-6 text-muted-foreground" />
                  Settings
                </Link>
              </nav>

              <div className="absolute bottom-12 left-8 right-8">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-xs text-muted-foreground">Logged in as</p>
                  <p className="font-bold text-accent-cyan truncate">{userEmail}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* INNER SCROLL CONTAINER */}
        <main className="flex-1 overflow-y-auto px-4 py-5 pb-24 space-y-6 scrollbar-none scroll-smooth">
          {children}
        </main>

        {/* BOTTOM NAVIGATION BAR */}
        <nav className="absolute bottom-0 left-0 right-0 h-20 bg-black/90 backdrop-blur-md border-t border-white/10 flex items-center justify-around px-2 z-50 md:rounded-b-[40px]">
          <Link
            href="/organization"
            className={`flex flex-col items-center gap-1.5 py-1 px-3 transition-colors duration-300 ${
              currentNav === "dashboard" ? "text-accent-cyan" : "text-muted-foreground hover:text-white"
            }`}
          >
            <LayoutGrid className="size-5" />
            <span className="text-[10px] font-semibold tracking-wider">Home</span>
          </Link>

          <Link
            href="/printers"
            className={`flex flex-col items-center gap-1.5 py-1 px-3 transition-colors duration-300 ${
              currentNav === "printers" ? "text-accent-cyan" : "text-muted-foreground hover:text-white"
            }`}
          >
            <Printer className="size-5" />
            <span className="text-[10px] font-semibold tracking-wider">Printers</span>
          </Link>

          <Link
            href="/organization/members"
            className={`flex flex-col items-center gap-1.5 py-1 px-3 transition-colors duration-300 ${
              currentNav === "members" ? "text-accent-cyan" : "text-muted-foreground hover:text-white"
            }`}
          >
            <KeyRound className="size-5" />
            <span className="text-[10px] font-semibold tracking-wider">Verify</span>
          </Link>

          <Link
            href="/organization/settings"
            className={`flex flex-col items-center gap-1.5 py-1 px-3 transition-colors duration-300 ${
              currentNav === "settings" ? "text-accent-cyan" : "text-muted-foreground hover:text-white"
            }`}
          >
            <Settings className="size-5" />
            <span className="text-[10px] font-semibold tracking-wider">Settings</span>
          </Link>
        </nav>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}

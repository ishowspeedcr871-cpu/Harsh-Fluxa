"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutGrid,
  Clock,
  Settings,
  User,
  Sparkles
} from "lucide-react";
import { NotificationBell } from "@/components/notifications/notification-bell";

interface CustomerPortalLayoutProps {
  children: React.ReactNode;
  userEmail?: string;
}

export function CustomerPortalLayout({ children, userEmail = "fluxa1409@gmail.com" }: CustomerPortalLayoutProps) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"home" | "rewards">("home");

  // Determine current bottom navigation tab based on path
  const currentNav = useMemo(() => {
    if (pathname.includes("/profile") || pathname.includes("/onboarding")) return "profile";
    if (pathname.includes("/settings")) return "settings";
    if (pathname.includes("/history")) return "history";
    return "dashboard";
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center p-0 md:p-6 select-none relative overflow-x-hidden font-sans">
      {/* Background radial neon decorative glows matching the image */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-accent-cyan/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-accent-magenta/5 blur-[120px] pointer-events-none" />

      {/* Styled Responsive Device Shell */}
      <div className="w-full max-w-md md:h-[880px] h-screen md:rounded-[40px] md:border md:border-white/10 bg-black flex flex-col relative overflow-hidden shadow-2xl shadow-accent-cyan/10">
        
        {/* TOP STATUS HEADER BAR (FLUXA BRAND & TOP NAV) */}
        <header className="px-5 pt-6 pb-4 bg-black/60 backdrop-blur-md flex items-center justify-between z-40 border-b border-white/5 sticky top-0">
          {/* Logo */}
          <Link href="/customer" className="flex items-center gap-1.5 focus:outline-none">
            <span className="text-[22px] font-black tracking-[0.12em] text-accent-cyan font-sans filter drop-shadow-[0_0_12px_rgba(184,100,70,0.35)]">
              FLUXA
            </span>
          </Link>

          {/* Home / Rewards Capsule Switcher */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-[3px] scale-[0.95]">
            <button
              onClick={() => {
                setActiveTab("home");
                router.push("/customer");
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 ${
                activeTab === "home"
                  ? "bg-gradient-to-r from-accent-cyan/15 to-accent-magenta/15 text-white shadow-inner border border-white/10"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => {
                setActiveTab("rewards");
                alert("Rewards Program coming soon!");
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 ${
                activeTab === "rewards"
                  ? "bg-gradient-to-r from-accent-cyan/15 to-accent-magenta/15 text-white shadow-inner border border-white/10"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              Rewards
            </button>
          </div>

          {/* User & Notifications Area */}
          <div className="flex items-center gap-3">
            {/* User Profile avatar icon with cyan neon glow ring */}
            <Link
              href="/customer/profile"
              className="relative flex items-center justify-center size-9 rounded-full border border-accent-cyan/40 bg-black/40 hover:border-accent-cyan transition-all duration-300 shadow-[0_0_10px_rgba(184,100,70,0.15)] overflow-hidden"
            >
              <div className="absolute inset-[1px] rounded-full border border-white/10 flex items-center justify-center text-accent-cyan">
                <User className="size-4" />
              </div>
            </Link>

            {/* Notification Bell with popover */}
            <NotificationBell portalType="customer" />
          </div>
        </header>

        {/* INNER SCROLL CONTAINER */}
        <main className="flex-1 overflow-y-auto px-4 py-5 pb-24 space-y-6 scrollbar-none scroll-smooth">
          {children}
        </main>

        {/* BOTTOM NAVIGATION BAR */}
        <nav className="absolute bottom-0 left-0 right-0 h-20 bg-black/90 backdrop-blur-md border-t border-white/10 flex items-center justify-around px-2 z-50 md:rounded-b-[40px]">
          {/* Dashboard */}
          <Link
            href="/customer"
            className={`flex flex-col items-center gap-1.5 py-1 px-3 transition-colors duration-300 ${
              currentNav === "dashboard" ? "text-accent-cyan" : "text-muted-foreground hover:text-white"
            }`}
          >
            <LayoutGrid className="size-5" />
            <span className="text-[10px] font-semibold tracking-wider">Dashboard</span>
          </Link>

          {/* History */}
          <Link
            href="/customer/history"
            className={`flex flex-col items-center gap-1.5 py-1 px-3 transition-colors duration-300 ${
              currentNav === "history" ? "text-accent-cyan" : "text-muted-foreground hover:text-white"
            }`}
          >
            <Clock className="size-5" />
            <span className="text-[10px] font-semibold tracking-wider">History</span>
          </Link>

          {/* Settings */}
          <Link
            href="/customer/settings"
            className={`flex flex-col items-center gap-1.5 py-1 px-3 transition-colors duration-300 ${
              currentNav === "settings" ? "text-accent-cyan" : "text-muted-foreground hover:text-white"
            }`}
          >
            <Settings className="size-5" />
            <span className="text-[10px] font-semibold tracking-wider">Settings</span>
          </Link>

          {/* Profile / Logout */}
          <Link
            href="/customer/profile"
            className={`flex flex-col items-center gap-1.5 py-1 px-3 transition-colors duration-300 ${
              currentNav === "profile" ? "text-accent-cyan" : "text-muted-foreground hover:text-white"
            }`}
          >
            <User className="size-5" />
            <span className="text-[10px] font-semibold tracking-wider">Profile</span>
          </Link>
        </nav>
      </div>

      {/* Styled Injectable CSS for Custom Components */}
      <style jsx global>{`
        /* Custom scrollbar hiding */
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Glow animations matching the mock-up */
        .shadow-neon-cyan {
          box-shadow: 0 0 15px rgba(184, 100, 70, 0.45);
        }
        .shadow-neon-magenta {
          box-shadow: 0 0 15px rgba(305, 100, 67, 0.4);
        }
      `}</style>
    </div>
  );
}

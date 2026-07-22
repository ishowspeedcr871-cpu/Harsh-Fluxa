"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { developerLogoutAction } from "@/services/auth/actions";
import {
  BarChart3,
  Building2,
  Search,
  Settings,
  ShieldCheck,
  UsersRound,
  Activity,
  Database,
  KeyRound,
  Megaphone,
  BriefcaseBusiness,
  LayoutGrid,
  Users,
  ShieldAlert,
  Cpu,
  Brain,
  ScanText,
  Workflow,
  HardDrive,
  HeartPulse,
  Bell,
  Printer,
  FileText,
  AlertTriangle,
  LogOut,
  MessageCircle,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

const items = [
  { label: "Dashboard", href: "/developer", icon: LayoutGrid },
  { label: "Users", href: "/developer/users", icon: Users },
  { label: "Employees", href: "/developer/employees", icon: ShieldCheck },
  { label: "Organizations", href: "/developer/organizations", icon: Building2 },
  { label: "Customers", href: "/developer/customers", icon: UsersRound },
  { label: "Approvals", href: "/developer/approvals", icon: BriefcaseBusiness },
  { label: "Subscriptions", href: "/developer/subscriptions", icon: FileText },
  { label: "Features", href: "/developer/features", icon: Cpu },
  { label: "Analytics", href: "/developer/analytics", icon: BarChart3 },
  { label: "Settings", href: "/developer/settings", icon: Settings },
  { label: "WhatsApp", href: "/developer/whatsapp", icon: MessageCircle },
  { label: "Audit", href: "/developer/audit-logs", icon: ShieldCheck },
  { label: "Errors", href: "/developer/errors", icon: AlertTriangle },
  { label: "API Keys", href: "/developer/api-keys", icon: KeyRound },
  { label: "AI", href: "/developer/ai", icon: Brain },
  { label: "AI Ops", href: "/developer/intelligence", icon: Workflow },
  { label: "Secrets", href: "/developer/secrets", icon: KeyRound },
  { label: "OCR", href: "/developer/ocr", icon: ScanText },
  { label: "Jobs", href: "/developer/jobs", icon: Printer },
  { label: "Storage", href: "/developer/storage", icon: HardDrive },
  { label: "Health", href: "/developer/health", icon: HeartPulse },
  { label: "Search", href: "/developer/search", icon: Search },
  { label: "Announcements", href: "/developer/announcements", icon: Megaphone },
] as const;

export function DeveloperNavigation() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-full flex-col bg-[#020203] lg:w-64 lg:border-r lg:border-white/5">
      {/* Branding - Hidden on mobile drawer because layout handles it */}
      <div className="hidden p-6 lg:block">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-[0.2em] text-accent-cyan leading-none">FLUXΛ</span>
            <p className="mt-1 text-[9px] font-bold tracking-[0.3em] text-muted-foreground uppercase ml-0.5">Master Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
        <div className="space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${
                  isActive 
                    ? "bg-accent-cyan/10 text-accent-cyan" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className={`size-4 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-accent-cyan" : ""}`} />
                {item.label}
                {isActive && (
                  <div className="ml-auto h-1 w-1 rounded-full bg-accent-cyan shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Profile Section */}
      <div className="border-t border-white/5 p-4 bg-[#050507] space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-9 border border-white/10" name="Master Developer" />
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-[11px] font-bold text-white">Master Developer</p>
            <p className="text-[10px] text-accent-cyan font-semibold uppercase tracking-tighter">Super Admin</p>
          </div>
          <div className="flex flex-col items-center justify-center rounded bg-white/5 px-1.5 py-0.5 text-[9px] font-black text-muted-foreground">
            MD
          </div>
        </div>
        <form action={developerLogoutAction} className="w-full">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-danger/10 hover:bg-danger/20 border border-danger/20 py-2.5 text-[10px] font-bold uppercase tracking-widest text-danger transition-all duration-300 cursor-pointer"
          >
            <LogOut className="size-3" />
            Exit Developer Session
          </button>
        </form>
      </div>
    </aside>
  );
}

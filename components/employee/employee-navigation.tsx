import Link from "next/link";
import { Briefcase, Gauge, Home, Printer, Search, Settings, UserRound } from "lucide-react";

const items = [
  { label: "Dashboard", href: "/employee", icon: Home },
  { label: "Assigned", href: "/employee/assigned", icon: Briefcase },
  { label: "Queue", href: "/employee/queue", icon: Gauge },
  { label: "Customers", href: "/employee/customers", icon: Search },
  { label: "Printers", href: "/employee/printers", icon: Printer },
  { label: "Profile", href: "/employee/profile", icon: UserRound },
  { label: "Settings", href: "/employee/settings", icon: Settings },
];

export function EmployeeNavigation() {
  return (
    <nav
      className="glass-surface flex flex-wrap gap-2 rounded-3xl p-3"
      aria-label="Employee portal"
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-center gap-2 rounded-2xl px-4 py-2 text-sm text-muted-foreground transition hover:bg-white/10 hover:text-accent-cyan"
        >
          <item.icon className="size-4" aria-hidden="true" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

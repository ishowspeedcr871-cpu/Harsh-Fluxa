import Link from "next/link";
import {
  Briefcase,
  PlusCircle,
  UserRound,
} from "lucide-react";

const items = [
  { label: "My Orders", href: "/customer", icon: Briefcase },
  { label: "New Order", href: "/customer/jobs/new", icon: PlusCircle },
  { label: "Profile", href: "/customer/profile", icon: UserRound },
];

export function CustomerNavigation() {
  return (
    <nav
      className="glass-surface flex flex-wrap gap-2 rounded-3xl p-3"
      aria-label="Customer portal"
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

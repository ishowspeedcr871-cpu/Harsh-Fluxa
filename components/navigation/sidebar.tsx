"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FluxaLogo } from "@/components/brand/fluxa-logo";
import {
  adminNavigationItems,
  employeeNavigationItems,
  customerNavigationItems,
} from "@/constants/navigation";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
  role?: "admin" | "employee" | "customer";
}

export function Sidebar({ className, role = "admin" }: SidebarProps) {
  const pathname = usePathname();

  const items =
    role === "customer"
      ? customerNavigationItems
      : role === "employee"
      ? employeeNavigationItems
      : adminNavigationItems;

  return (
    <aside
      className={cn(
        "glass-surface hidden min-h-[calc(100vh-2rem)] w-64 rounded-3xl p-4 lg:block",
        className,
      )}
    >
      <FluxaLogo className="px-3 py-4" />
      <nav className="mt-8 space-y-2" aria-label="Primary navigation">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-muted-foreground transition hover:bg-white/10 hover:text-accent-cyan",
                isActive && "bg-accent-cyan/10 text-accent-cyan shadow-cyan",
              )}
            >
              <item.icon className="size-5" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

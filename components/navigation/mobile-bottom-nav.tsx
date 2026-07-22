"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  adminNavigationItems,
  employeeNavigationItems,
  customerNavigationItems,
} from "@/constants/navigation";

interface MobileBottomNavProps {
  role?: "admin" | "employee" | "customer";
}

export function MobileBottomNav({ role = "admin" }: MobileBottomNavProps) {
  const pathname = usePathname();

  const items =
    role === "customer"
      ? customerNavigationItems
      : role === "employee"
      ? employeeNavigationItems
      : adminNavigationItems;

  return (
    <nav
      className="glass-surface fixed inset-x-4 bottom-4 z-40 flex justify-around rounded-3xl px-2 py-3 lg:hidden"
      aria-label="Mobile navigation"
    >
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              isActive
                ? "flex flex-col items-center gap-1 text-[11px] text-accent-cyan"
                : "flex flex-col items-center gap-1 text-[11px] text-muted-foreground"
            }
          >
            <item.icon className="size-5" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

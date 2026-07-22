"use client";

import { ThemeProvider } from "@/providers/theme-provider";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    // Check if the current route is part of the Master Developer portal
    const isDeveloperPortal = pathname.startsWith("/developer");

    if (isDeveloperPortal) {
      document.documentElement.setAttribute("data-portal", "developer");
    } else {
      document.documentElement.setAttribute("data-portal", "user");
    }
  }, [pathname]);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
      {children}
    </ThemeProvider>
  );
}

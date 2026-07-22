import type { Metadata, Viewport } from "next";
import { AppProviders } from "@/providers/app-providers";
import { RootBackground } from "@/layouts/root-background";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: { default: "FLUXA", template: "%s | FLUXA" },
  description: "Enterprise multi-tenant print management SaaS platform.",
  applicationName: "FLUXA",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#000000" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}

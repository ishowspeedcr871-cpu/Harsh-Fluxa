import { Sidebar } from "@/components/navigation/sidebar";
import { TopNavigation } from "@/components/navigation/top-navigation";
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role?: "admin" | "employee" | "customer";
}

export function DashboardLayout({ children, role = "admin" }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen gap-6 p-4">
      <Sidebar role={role} />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 pb-24 lg:pb-4">
        <TopNavigation />
        {children}
      </main>
      <MobileBottomNav role={role} />
    </div>
  );
}

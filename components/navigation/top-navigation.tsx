import { Search, ShieldCheck, SunMoon, UserRound } from "lucide-react";
import { OrganizationSwitcher } from "@/components/organizations/organization-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotificationBell } from "@/components/notifications/notification-bell";

export async function TopNavigation() {
  return (
    <header className="glass-surface sticky top-4 z-40 flex items-center gap-3 rounded-full px-4 py-3">
      <div className="relative hidden flex-1 md:block">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input className="pl-10" placeholder="Search FLUXA" />
      </div>
      <OrganizationSwitcher />
      <Button variant="ghost" size="icon" aria-label="Toggle theme">
        <SunMoon className="size-5" aria-hidden="true" />
      </Button>
      <NotificationBell />
      <Button variant="secondary" className="hidden md:inline-flex">
        <ShieldCheck className="size-4" aria-hidden="true" />
        Developer
      </Button>
      <Button variant="secondary" size="icon" aria-label="Profile">
        <UserRound className="size-5" aria-hidden="true" />
      </Button>
    </header>
  );
}

import { cn } from "@/lib/utils";
export function DrawerShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "glass-surface fixed inset-y-4 right-4 z-50 w-[min(28rem,calc(100vw-2rem))] rounded-3xl p-6",
        className,
      )}
    >
      {children}
    </aside>
  );
}

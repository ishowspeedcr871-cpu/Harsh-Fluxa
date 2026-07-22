import { cn } from "@/lib/utils";
export function TabsList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("glass-surface inline-flex rounded-full p-1", className)}>{children}</div>
  );
}
export function TabButton({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <button
      className={cn(
        "focus-ring rounded-full px-4 py-2 text-sm text-muted-foreground transition",
        active && "bg-accent-cyan/15 text-accent-cyan shadow-cyan",
      )}
    >
      {children}
    </button>
  );
}

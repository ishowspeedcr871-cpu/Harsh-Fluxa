import { cn } from "@/lib/utils";
export function TooltipLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "rounded-full border border-white/10 bg-black/80 px-3 py-1 text-xs text-muted-foreground shadow-glass backdrop-blur-xl",
        className,
      )}
    >
      {children}
    </span>
  );
}

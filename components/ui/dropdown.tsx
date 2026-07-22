import { cn } from "@/lib/utils";
export function DropdownPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("glass-surface min-w-56 rounded-3xl p-2", className)}>{children}</div>;
}

import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
export function Avatar({ name = "FLUXA User", className }: { name?: string; className?: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className={cn(
        "flex size-11 items-center justify-center rounded-full border border-accent-cyan/30 bg-accent-cyan/10 text-sm font-semibold text-accent-cyan shadow-cyan",
        className,
      )}
    >
      {initials || <UserRound className="size-5" />}
    </div>
  );
}

import * as React from "react";
import type { FluxaStatusTone } from "@/constants/status";
import { cn } from "@/lib/utils";

const toneClasses: Record<FluxaStatusTone, string> = {
  cyan: "border-accent-cyan/35 bg-accent-cyan/15 text-accent-cyan shadow-cyan",
  magenta: "border-accent-magenta/35 bg-accent-magenta/15 text-accent-magenta shadow-magenta",
  success: "border-success/35 bg-success/15 text-success",
  warning: "border-warning/35 bg-warning/15 text-warning",
  danger: "border-danger/35 bg-danger/15 text-danger",
  muted: "border-white/10 bg-white/5 text-muted-foreground",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: FluxaStatusTone;
}

export function Badge({ className, tone = "cyan", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}

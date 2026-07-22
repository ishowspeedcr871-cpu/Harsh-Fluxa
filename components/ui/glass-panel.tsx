import * as React from "react";
import { surfaceClass, type SurfaceVariant } from "@/lib/variants";
import { cn } from "@/lib/utils";

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  surface?: SurfaceVariant;
  glow?: "none" | "cyan" | "magenta";
}

const glowClasses = {
  none: "",
  cyan: "shadow-cyan",
  magenta: "shadow-magenta",
} as const;

export function GlassPanel({
  className,
  surface = "glass",
  glow = "none",
  ...props
}: GlassPanelProps) {
  return (
    <div
      className={surfaceClass(surface, cn("rounded-3xl p-6", glowClasses[glow], className))}
      {...props}
    />
  );
}

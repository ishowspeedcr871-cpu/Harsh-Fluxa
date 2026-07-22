import { cn } from "@/lib/utils";

export const surfaceVariants = {
  glass:
    "border border-white/10 bg-surface-glass/60 shadow-glass backdrop-blur-2xl supports-[backdrop-filter]:bg-surface-glass/45",
  elevated: "border border-white/10 bg-surface-elevated/90 shadow-glass backdrop-blur-xl",
  subtle: "border border-white/10 bg-white/[0.04] backdrop-blur-xl",
} as const;

export type SurfaceVariant = keyof typeof surfaceVariants;

export function surfaceClass(variant: SurfaceVariant = "glass", className?: string) {
  return cn(surfaceVariants[variant], className);
}

import { cn } from "@/lib/utils";

export function FluxaLogo({ className }: { className?: string }) {
  return (
    <div className={cn("text-2xl font-semibold tracking-[0.35em] text-white", className)}>
      FLUXA
    </div>
  );
}

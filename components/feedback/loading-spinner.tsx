import { cn } from "@/lib/utils";
export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block size-5 animate-spin rounded-full border-2 border-accent-cyan/30 border-t-accent-cyan",
        className,
      )}
      aria-label="Loading"
    />
  );
}

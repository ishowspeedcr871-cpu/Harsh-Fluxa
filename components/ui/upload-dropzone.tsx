import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
export function UploadDropzone({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "glass-surface flex min-h-64 flex-col items-center justify-center rounded-3xl border-dashed p-8 text-center",
        className,
      )}
    >
      <div className="mb-5 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 p-5 shadow-cyan">
        <UploadCloud className="size-10 text-accent-cyan" />
      </div>
      <h3 className="text-xl font-semibold">Drop files here</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        A reusable visual-only upload surface for future upload workflows.
      </p>
    </div>
  );
}

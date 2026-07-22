import type { PrintJobStatus } from "@prisma/client";
import { Progress } from "@/components/ui/progress";
import { getPrintJobLifecycle } from "@/services/print-jobs/print-job-service";

export function PrintJobStatusFlow({ status }: { status: PrintJobStatus }) {
  const steps = getPrintJobLifecycle();
  const currentIndex = Math.max(0, steps.indexOf(status));
  const progress = ((currentIndex + 1) / steps.length) * 100;
  const statusLabel =
    status === "OTP_GENERATED"
      ? "ready for collection · OTP generated"
      : status.replaceAll("_", " ").toLowerCase();
  return (
    <div className="space-y-3">
      <Progress value={progress} />
      <p className="text-sm font-medium text-foreground">Current status: {statusLabel}</p>
      <div className="grid gap-2 text-xs text-muted-foreground md:grid-cols-5">
        {steps.map((step, index) => (
          <span key={step} className={index <= currentIndex ? "text-accent-cyan" : undefined}>
            {step.replaceAll("_", " ").toLowerCase()}
          </span>
        ))}
      </div>
    </div>
  );
}

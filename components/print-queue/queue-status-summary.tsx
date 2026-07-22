import { MetricCard } from "@/components/ui/metric-card";

export function QueueStatusSummary({
  stats,
}: {
  stats: { queued: number; assignedToMe: number; printing: number; ready: number; urgent: number };
}) {
  return (
    <div className="grid gap-4 md:grid-cols-5">
      <MetricCard label="Queued" value={String(stats.queued)} />
      <MetricCard label="Assigned to me" value={String(stats.assignedToMe)} tone="magenta" />
      <MetricCard label="Printing" value={String(stats.printing)} />
      <MetricCard label="Ready" value={String(stats.ready)} tone="success" />
      <MetricCard label="Urgent" value={String(stats.urgent)} tone="magenta" />
    </div>
  );
}

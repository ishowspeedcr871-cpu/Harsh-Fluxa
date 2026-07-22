import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  trend,
  tone = "cyan",
}: {
  label: string;
  value: string;
  trend?: string;
  tone?: "cyan" | "magenta" | "success";
}) {
  const valueTone = {
    cyan: "text-accent-cyan",
    magenta: "text-accent-magenta",
    success: "text-success",
  }[tone];

  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className={cn("text-4xl", valueTone)}>{value}</CardTitle>
      </CardHeader>
      {trend ? <p className="text-xs text-muted-foreground">{trend}</p> : null}
    </Card>
  );
}

import { Badge } from "@/components/ui/badge";
import { statusToneMap } from "@/constants/status";

export function StatusBadge({
  status,
  label,
}: {
  status: keyof typeof statusToneMap;
  label?: string;
}) {
  return <Badge tone={statusToneMap[status]}>{label ?? status.replaceAll("_", " ")}</Badge>;
}

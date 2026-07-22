import { Badge } from "@/components/ui/badge";
export function NotificationToast({ title, description }: { title: string; description?: string }) {
  return (
    <div className="glass-surface max-w-sm rounded-3xl p-4">
      <Badge>Update</Badge>
      <h3 className="mt-3 font-semibold">{title}</h3>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}

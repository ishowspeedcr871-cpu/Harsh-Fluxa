import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
export function DialogShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-xl">
      <Card className={cn("w-full max-w-lg", className)}>{children}</Card>
    </div>
  );
}

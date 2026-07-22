import * as React from "react";
import { surfaceClass, type SurfaceVariant } from "@/lib/variants";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  surface?: SurfaceVariant;
  interactive?: boolean;
}

export function Card({ className, surface = "glass", interactive = true, ...props }: CardProps) {
  return (
    <div
      className={surfaceClass(
        surface,
        cn(
          "rounded-3xl p-6 transition duration-300",
          interactive && "hover:-translate-y-0.5 hover:border-accent-cyan/35 hover:shadow-cyan",
          className,
        ),
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4 space-y-1.5", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold tracking-tight", className)} {...props} />;
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm leading-6 text-muted-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-4", className)} {...props} />;
}

import * as React from "react";
import { cn } from "@/lib/utils";
export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "focus-ring h-11 w-full rounded-full border border-white/10 bg-black/70 px-4 text-sm text-foreground backdrop-blur-xl transition focus:border-accent-cyan/60",
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

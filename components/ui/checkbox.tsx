import * as React from "react";
import { cn } from "@/lib/utils";
export const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    type="checkbox"
    className={cn(
      "focus-ring size-5 rounded border-white/20 bg-white/10 accent-cyan-300",
      className,
    )}
    {...props}
  />
));
Checkbox.displayName = "Checkbox";

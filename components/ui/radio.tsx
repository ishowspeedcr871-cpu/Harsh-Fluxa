import * as React from "react";
import { cn } from "@/lib/utils";
export const Radio = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    type="radio"
    className={cn("focus-ring size-5 border-white/20 bg-white/10 accent-cyan-300", className)}
    {...props}
  />
));
Radio.displayName = "Radio";

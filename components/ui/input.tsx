import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "focus-ring h-11 w-full rounded-full border border-white/10 bg-white/[0.06] px-4 text-sm text-foreground placeholder:text-muted-foreground shadow-inner backdrop-blur-xl transition focus:border-accent-cyan/60",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

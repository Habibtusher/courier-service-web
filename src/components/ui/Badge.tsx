import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "info" | "success" | "warning" | "error";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
    outline: "text-foreground border-border",
    info: "border-transparent bg-info-light text-info-dark font-semibold border border-info/30",
    success: "border-transparent bg-success-light text-success-dark font-semibold border border-success/30",
    warning: "border-transparent bg-warning-light text-warning-dark font-semibold border border-warning/30",
    error: "border-transparent bg-error-light text-error-dark font-semibold border border-error/30",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };

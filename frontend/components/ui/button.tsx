import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "ghost" | "outline";
  size?: "default" | "sm";
};

export function Button({ className, variant = "default", size = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variant === "default" && "border-transparent bg-foreground text-background shadow-glow hover:-translate-y-0.5",
        variant === "secondary" && "border-border bg-card text-foreground hover:bg-muted",
        variant === "ghost" && "border-transparent bg-transparent text-foreground hover:bg-muted",
        variant === "outline" && "border-border bg-transparent text-foreground hover:bg-muted",
        size === "sm" && "px-3 py-1.5 text-xs",
        className,
      )}
      {...props}
    />
  );
}

import * as React from "react";

import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("min-h-32 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-ring", className)} {...props} />;
}

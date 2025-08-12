import * as React from "react";
import { cn } from "@/src/lib/utils";


export function DashboardHeader({
  heading,
  text,
  children,
  className,
}) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="grid gap-1">
        <h1 className="text-2xl font-bold tracking-wide">{heading}</h1>
        {text && (
          <p className="text-muted-foreground text-sm">
            {text}
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
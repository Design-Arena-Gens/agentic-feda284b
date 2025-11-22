import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "blue" | "outline";
}

export function Badge({ variant = "default", className, ...props }: BadgeProps) {
  const styles = {
    default: "bg-zinc-100 text-zinc-700",
    blue: "bg-blue-100 text-blue-700",
    outline: "border border-zinc-200 text-zinc-600",
  } satisfies Record<Required<BadgeProps>["variant"], string>;

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}

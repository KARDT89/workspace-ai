import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
  priority: "high" | "medium" | "low";
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  if (priority === "medium") return null;

  if (priority === "high") {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[10px] font-medium leading-none",
          "border border-amber-500/30 bg-amber-500/20 text-amber-400",
          className,
        )}
      >
        ⚡ High
      </span>
    );
  }

  // low — shown subtly, callers can hide it when not hovered
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[10px] font-medium leading-none",
        "border border-border bg-muted text-muted-foreground",
        className,
      )}
    >
      Low
    </span>
  );
}

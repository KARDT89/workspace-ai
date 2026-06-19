"use client";

import { cn } from "@/lib/utils";

interface MovingBorderProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  /** Rotation duration in seconds */
  duration?: number;
}

export function MovingBorder({
  children,
  className,
  containerClassName,
  duration = 3,
}: MovingBorderProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl p-[1px]", containerClassName)}>
      {/* Spinning conic gradient — creates the traveling border highlight */}
      <div
        className="absolute animate-spin"
        style={{
          inset: "-100%",
          animationDuration: `${duration}s`,
          animationTimingFunction: "linear",
          background:
            "conic-gradient(from 90deg at 50% 50%, transparent 0%, oklch(0.623 0.214 259.5 / 0.8) 35%, oklch(0.623 0.214 259.5) 50%, oklch(0.623 0.214 259.5 / 0.8) 65%, transparent 100%)",
        }}
      />
      <div className={cn("relative rounded-[11px] bg-card", className)}>{children}</div>
    </div>
  );
}

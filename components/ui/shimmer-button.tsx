"use client";

import { cn } from "@/lib/utils";
import React from "react";

// Uses the `shimmer-sweep` keyframe defined in globals.css
interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export function ShimmerButton({ children, className, ...props }: ShimmerButtonProps) {
  return (
    <button
      className={cn(
        "relative overflow-hidden rounded-lg px-5 py-2 text-sm font-medium text-white",
        "transition-transform hover:scale-[1.02] active:scale-[0.98]",
        "disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
      style={{ background: "oklch(0.623 0.214 259.5)" }}
      {...props}
    >
      <span
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
          backgroundSize: "300% 100%",
          animation: "shimmer-sweep 2s linear infinite",
        }}
      />
      <span className="relative">{children}</span>
    </button>
  );
}

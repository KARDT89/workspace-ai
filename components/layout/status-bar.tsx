"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const FOLDER_LABELS: Record<string, string> = {
  "/mail": "Inbox",
  "/calendar": "Calendar",
  "/agent": "Agent",
  "/settings": "Settings",
};

const KEYBOARD_HINTS: Record<string, string> = {
  "/mail": "j/k navigate · e archive · c compose",
  "/calendar": "[ / ] week · n new event",
  "/agent": "⌘↵ send",
  "/settings": "",
};

function getSegment(pathname: string): string {
  const key = Object.keys(FOLDER_LABELS).find((k) => pathname.startsWith(k));
  return key ?? "/mail";
}

export interface StatusBarProps {
  unreadCount?: number;
  aiActivity?: string | null;
  className?: string;
}

export function StatusBar({ unreadCount = 0, aiActivity, className }: StatusBarProps) {
  const pathname = usePathname();
  const segment = getSegment(pathname);
  const folderLabel = FOLDER_LABELS[segment];
  const hint = KEYBOARD_HINTS[segment];

  return (
    <div
      className={cn(
        "flex h-7 shrink-0 items-center border-t border-border px-3",
        "bg-[var(--status-bar)] font-mono text-[11px] text-muted-foreground",
        className,
      )}
    >
      {/* Left — folder + unread */}
      <div className="flex items-center gap-2">
        <span className="text-foreground/70">{folderLabel}</span>
        {segment === "/mail" && unreadCount > 0 && (
          <>
            <span className="text-border">·</span>
            <span className="text-amber-400">{unreadCount} unread</span>
          </>
        )}
      </div>

      {/* Center — AI activity */}
      <div className="flex flex-1 items-center justify-center">
        {aiActivity && (
          <span
            className="text-primary/80"
            style={{
              background:
                "linear-gradient(90deg, oklch(0.623 0.214 259.5 / 0.6), oklch(0.623 0.214 259.5), oklch(0.623 0.214 259.5 / 0.6))",
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "shimmer-sweep 2s linear infinite",
            }}
          >
            ⚡ {aiActivity}
          </span>
        )}
      </div>

      {/* Right — keyboard hint */}
      {hint && (
        <div className="text-muted-foreground/60">{hint}</div>
      )}
    </div>
  );
}

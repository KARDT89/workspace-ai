"use client";

import { cn } from "@/lib/utils";
import { parseEmailAddress } from "@/server/lib/email-encoding";
import type { InboxMessage } from "@/server/db/queries/gmail";

type Props = {
  message: InboxMessage;
  selected: boolean;
  onClick: () => void;
};

function formatDate(internalDate: string): string {
  if (!internalDate) return "";
  const ms = Number(internalDate);
  const d = isNaN(ms) ? new Date(internalDate) : new Date(ms);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86_400_000 && d.getDate() === now.getDate()) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diff < 7 * 86_400_000) {
    return d.toLocaleDateString([], { weekday: "short" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

const PRIORITY_BADGE: Record<string, { label: string; cls: string }> = {
  high: { label: "⚡ High", cls: "bg-amber-500/20 text-amber-400 border border-amber-500/30" },
  low: { label: "Low", cls: "bg-muted text-muted-foreground border border-border" },
};

export function ThreadRow({ message, selected, onClick }: Props) {
  const sender = parseEmailAddress(message.from);
  const displayName = sender.name || sender.email || message.from;
  const badge = message.priority ? PRIORITY_BADGE[message.priority] : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3 flex flex-col gap-0.5 border-b border-border/50 transition-colors relative",
        "hover:bg-accent/50",
        selected && "bg-accent border-l-2 border-l-primary",
        !selected && "border-l-2 border-l-transparent"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {message.unread && (
            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
          )}
          <span
            className={cn(
              "text-sm truncate",
              message.unread ? "font-semibold text-foreground" : "font-normal text-muted-foreground"
            )}
          >
            {displayName}
          </span>
        </div>
        <span className="text-xs text-muted-foreground shrink-0">
          {formatDate(message.internalDate)}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "text-sm truncate",
            message.unread ? "font-medium text-foreground" : "text-muted-foreground"
          )}
        >
          {message.subject}
        </span>
        {badge && (
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded shrink-0 font-medium", badge.cls)}>
            {badge.label}
          </span>
        )}
      </div>

      <p className="text-xs text-muted-foreground truncate">{message.snippet}</p>
    </button>
  );
}

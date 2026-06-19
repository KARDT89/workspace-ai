"use client";

import { cn } from "@/lib/utils";
import { parseEmailAddress } from "@/server/lib/email-encoding";
import { SenderAvatar } from "./sender-avatar";
import { PriorityBadge } from "./priority-badge";
import { Archive, Star, Trash } from "@phosphor-icons/react";
import type { InboxMessage } from "@/server/db/queries/gmail";

// ── Date formatting ────────────────────────────────────────────────────────────

function formatDate(internalDate: string): string {
  if (!internalDate) return "";
  const ms = Number(internalDate);
  const d = isNaN(ms) ? new Date(internalDate) : new Date(ms);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();

  if (d.getDate() === now.getDate() && diffMs < 86_400_000) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffMs < 7 * 86_400_000) {
    return d.toLocaleDateString([], { weekday: "short" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

// ── Quick action button ────────────────────────────────────────────────────────

function QuickAction({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  danger?: boolean;
}) {
  return (
    <button
      aria-label={label}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
        danger
          ? "text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      <Icon size={14} />
    </button>
  );
}

// ── ThreadRow ──────────────────────────────────────────────────────────────────

type Props = {
  message: InboxMessage;
  selected: boolean;
  onClick: () => void;
  onArchive?: (entityId: string) => void;
  onDelete?: (entityId: string) => void;
};

export function ThreadRow({ message, selected, onClick, onArchive, onDelete }: Props) {
  const sender = parseEmailAddress(message.from);
  const displayName = sender.name || sender.email || message.from;
  const unread = message.unread;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex h-18 w-full items-center gap-2.5 pl-4 pr-3",
        "border-b border-border/40 text-left transition-colors duration-75",
        selected ? "bg-(--thread-selected)" : "hover:bg-(--thread-hover)",
      )}
    >
      {/* Left accent bar */}
      <div
        className={cn(
          "absolute inset-y-3 left-0 w-0.5 rounded-r-full transition-colors",
          (unread || selected) ? "bg-primary" : "bg-transparent",
        )}
      />

      {/* Unread dot + avatar column */}
      <div className="flex shrink-0 flex-col items-center gap-1.5">
        <div className={cn("h-1.5 w-1.5 rounded-full", unread ? "bg-primary" : "bg-transparent")} />
        <SenderAvatar name={displayName} size={32} />
      </div>

      {/* Text content */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 overflow-hidden">
        {/* Row 1: sender + timestamp */}
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              "flex-1 truncate text-sm",
              unread ? "font-semibold text-foreground" : "font-normal text-muted-foreground",
            )}
          >
            {displayName}
          </span>
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {formatDate(message.internalDate)}
          </span>
        </div>

        {/* Row 2: subject + priority badge */}
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "flex-1 truncate text-[13px]",
              unread ? "font-medium text-foreground" : "text-muted-foreground",
            )}
          >
            {message.subject}
          </span>
          {message.priority && message.priority !== "medium" && (
            <PriorityBadge
              priority={message.priority}
              className={
                message.priority === "low"
                  ? "opacity-0 transition-opacity group-hover:opacity-100"
                  : undefined
              }
            />
          )}
        </div>

        {/* Row 3: snippet */}
        <p className="truncate text-xs text-muted-foreground">{message.snippet}</p>
      </div>

      {/* Quick actions — slide in on hover, hide behind timestamp otherwise */}
      <div
        aria-hidden="true"
        className="absolute right-2 flex items-center gap-0.5 translate-x-2 opacity-0 transition-all duration-100 group-hover:translate-x-0 group-hover:opacity-100"
      >
        {onArchive && (
          <QuickAction icon={Archive} label="Archive" onClick={() => onArchive(message.entityId)} />
        )}
        <QuickAction icon={Star} label="Star" onClick={() => {}} />
        {onDelete && (
          <QuickAction icon={Trash} label="Delete" onClick={() => onDelete(message.entityId)} danger />
        )}
      </div>
    </button>
  );
}

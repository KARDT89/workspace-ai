"use client";

import {
  ArchiveBoxIcon,
  ArrowBendDoubleUpLeft,
  ArrowBendUpLeft,
  ArrowBendUpRight,
  Trash,
} from "@phosphor-icons/react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Props = {
  onReply: () => void;
  onReplyAll: () => void;
  onForward: () => void;
};

const actions = [
  { label: "Reply", shortcut: "r", icon: ArrowBendUpLeft, key: "reply" },
  { label: "Reply all", shortcut: "a", icon: ArrowBendDoubleUpLeft, key: "replyAll" },
  { label: "Forward", shortcut: "f", icon: ArrowBendUpRight, key: "forward" },
  { label: "Archive", shortcut: "e", icon: ArchiveBoxIcon, key: "archive", disabled: true },
  { label: "Delete", shortcut: "#", icon: Trash, key: "delete", disabled: true },
] as const;

export function ReplyToolbar({ onReply, onReplyAll, onForward }: Props) {
  const handlers = { reply: onReply, replyAll: onReplyAll, forward: onForward };

  return (
    <div className="flex h-14 shrink-0 items-center gap-1 border-t border-border bg-background/90 px-4 backdrop-blur-md">
      {actions.map((action) => {
        const Icon = action.icon;
        const disabled = "disabled" in action && action.disabled;
        return (
          <Tooltip key={action.key}>
            <TooltipTrigger asChild>
              <button
                type="button"
                disabled={disabled}
                onClick={disabled ? undefined : handlers[action.key as keyof typeof handlers]}
                className="flex h-9 items-center gap-2 rounded-md px-3 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-35"
              >
                <Icon size={16} />
                <span className="hidden xl:inline">{action.label}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={6}>
              {action.label} <kbd className="font-mono opacity-70">{action.shortcut}</kbd>
              {disabled && <span className="opacity-70">Not available</span>}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

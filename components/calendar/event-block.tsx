"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { EventDetailPopover } from "./event-detail-popover";
import type { CalendarEvent } from "@/server/services/calendar";
import { cn } from "@/lib/utils";

interface Props {
  event: CalendarEvent;
  top: number;
  height: number;
  col: number;
  total: number;
  isSelected: boolean;
  onClick: () => void;
}

const COLOR_CLASSES: Record<string, string> = {
  "1": "bg-sky-500",
  "2": "bg-teal-500",
  "3": "bg-violet-500",
  "4": "bg-rose-400",
  "5": "bg-amber-500",
  "6": "bg-orange-500",
  "7": "bg-cyan-500",
  "8": "bg-slate-500",
  "9": "bg-blue-700",
  "10": "bg-green-600",
  "11": "bg-red-600",
};

function getColor(colorId?: string) {
  return colorId ? (COLOR_CLASSES[colorId] ?? "bg-blue-500") : "bg-blue-500";
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function EventBlock({ event, top, height, col, total, isSelected, onClick }: Props) {
  const widthPct = 100 / total;
  const leftPct = col * widthPct;
  const color = getColor(event.colorId);

  return (
    <Popover open={isSelected} onOpenChange={(open) => !open && onClick()}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "absolute cursor-pointer overflow-hidden rounded-md border border-white/15 px-1.5 py-1 text-left text-white shadow-sm transition-[filter] hover:brightness-95",
            color,
            isSelected && "ring-2 ring-white ring-offset-1"
          )}
          style={{
            top: top + 1,
            height: Math.max(height - 2, 18),
            left: `${leftPct + 0.5}%`,
            width: `${widthPct - 1}%`,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <p className="text-xs font-medium leading-tight truncate">{event.title}</p>
          {height > 32 && (
            <p className="text-[10px] opacity-80 truncate">{formatTime(event.start)}</p>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <EventDetailPopover event={event} />
      </PopoverContent>
    </Popover>
  );
}

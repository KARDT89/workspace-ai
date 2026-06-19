"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EventBlock } from "./event-block";
import { CreateEventModal } from "./create-event-modal";
import type { CalendarEvent } from "@/server/services/calendar";
import { cn } from "@/lib/utils";

const HOUR_HEIGHT = 64;
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function formatHour(h: number): string {
  if (h === 0) return "";
  return h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`;
}

function getEventPosition(event: CalendarEvent): { top: number; height: number } {
  const start = new Date(event.start);
  const end = new Date(event.end);
  const startMins = start.getHours() * 60 + start.getMinutes();
  const endMins = end.getHours() * 60 + end.getMinutes();
  const top = (startMins / 60) * HOUR_HEIGHT;
  const height = Math.max(((endMins - startMins) / 60) * HOUR_HEIGHT, 20);
  return { top, height };
}

function isOnDay(event: CalendarEvent, day: Date): boolean {
  if (event.allDay) return false;
  const d = new Date(event.start);
  return (
    d.getFullYear() === day.getFullYear() &&
    d.getMonth() === day.getMonth() &&
    d.getDate() === day.getDate()
  );
}

function isAllDayOnDay(event: CalendarEvent, day: Date): boolean {
  if (!event.allDay) return false;
  const start = new Date(event.start);
  const end = new Date(event.end);
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);
  return start < dayEnd && end > dayStart;
}

function assignColumns(events: CalendarEvent[]): Map<string, { col: number; total: number }> {
  const result = new Map<string, { col: number; total: number }>();
  if (!events.length) return result;

  const sorted = [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  const columns: CalendarEvent[][] = [];

  for (const event of sorted) {
    let placed = false;
    for (let c = 0; c < columns.length; c++) {
      const last = columns[c][columns[c].length - 1];
      if (new Date(last.end) <= new Date(event.start)) {
        columns[c].push(event);
        result.set(event.id, { col: c, total: 1 });
        placed = true;
        break;
      }
    }
    if (!placed) {
      columns.push([event]);
      result.set(event.id, { col: columns.length - 1, total: 1 });
    }
  }

  for (const event of events) {
    const info = result.get(event.id)!;
    result.set(event.id, { ...info, total: columns.length });
  }

  return result;
}

export function WeekView() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [showCreate, setShowCreate] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: events = [], isLoading } = useQuery<CalendarEvent[]>({
    queryKey: ["calendar-events", weekStart.toISOString()],
    queryFn: () =>
      fetch(`/api/calendar/events?weekStart=${weekStart.toISOString()}`).then((r) => r.json()),
  });

  const prevWeek = useCallback(() => setWeekStart((d) => addDays(d, -7)), []);
  const nextWeek = useCallback(() => setWeekStart((d) => addDays(d, 7)), []);
  const goToday = useCallback(() => setWeekStart(getWeekStart(new Date())), []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 7 * HOUR_HEIGHT;
    }
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "[") prevWeek();
      if (e.key === "]") nextWeek();
      if (e.key === "t") goToday();
      if (e.key === "n") setShowCreate(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prevWeek, nextWeek, goToday]);

  const todayDate = new Date();
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  function isToday(d: Date) {
    return (
      d.getDate() === todayDate.getDate() &&
      d.getMonth() === todayDate.getMonth() &&
      d.getFullYear() === todayDate.getFullYear()
    );
  }

  const allDayByDay = days.map((d) => events.filter((e) => isAllDayOnDay(e, d)));
  const hasAllDay = allDayByDay.some((arr) => arr.length > 0);

  const monthLabel = weekStart.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col h-full overflow-hidden select-none">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b shrink-0">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={prevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium w-40 text-center">{monthLabel}</span>
          <Button variant="ghost" size="icon" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToday}>
            Today
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            New Event
          </Button>
        </div>
      </div>

      {/* Day headers */}
      <div
        className="grid shrink-0 border-b"
        style={{ gridTemplateColumns: "52px repeat(7, 1fr)" }}
      >
        <div />
        {days.map((d, i) => (
          <div key={i} className="flex flex-col items-center py-1.5 border-l first:border-l-0">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wide">
              {DAY_LABELS[i]}
            </span>
            <span
              className={cn(
                "mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm",
                isToday(d)
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-foreground font-normal"
              )}
            >
              {d.getDate()}
            </span>
          </div>
        ))}
      </div>

      {/* All-day row */}
      {hasAllDay && (
        <div
          className="grid shrink-0 border-b"
          style={{ gridTemplateColumns: "52px repeat(7, 1fr)" }}
        >
          <div className="flex items-center justify-end pr-2 py-1">
            <span className="text-[10px] text-muted-foreground">all day</span>
          </div>
          {days.map((d, i) => (
            <div key={i} className="min-h-6 p-0.5 border-l">
              {allDayByDay[i].map((e) => (
                <div
                  key={e.id}
                  className="text-[11px] bg-primary/15 text-primary px-1 py-0.5 rounded mb-0.5 truncate"
                >
                  {e.title}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Scrollable time grid */}
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div
          className="grid"
          style={{
            gridTemplateColumns: "52px repeat(7, 1fr)",
            height: `${24 * HOUR_HEIGHT}px`,
          }}
        >
          {/* Hour labels */}
          <div className="relative">
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute right-2 text-[10px] text-muted-foreground"
                style={{ top: h * HOUR_HEIGHT - 7 }}
              >
                {formatHour(h)}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((d, di) => {
            const dayEvents = events.filter((e) => isOnDay(e, d));
            const positions = assignColumns(dayEvents);

            return (
              <div
                key={di}
                className="relative border-l"
                style={{ height: `${24 * HOUR_HEIGHT}px` }}
                onClick={() => setSelectedEventId(null)}
              >
                {/* Hour lines */}
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="absolute w-full border-t border-border/40"
                    style={{ top: h * HOUR_HEIGHT }}
                  />
                ))}

                {/* Loading skeleton */}
                {isLoading && di === 0 && (
                  <div className="absolute inset-x-1 space-y-2 mt-16">
                    <Skeleton className="h-10 rounded" />
                    <Skeleton className="h-16 rounded" />
                    <Skeleton className="h-8 rounded" />
                  </div>
                )}

                {/* Events */}
                {dayEvents.map((e) => {
                  const { top, height } = getEventPosition(e);
                  const colInfo = positions.get(e.id) ?? { col: 0, total: 1 };
                  return (
                    <EventBlock
                      key={e.id}
                      event={e}
                      top={top}
                      height={height}
                      col={colInfo.col}
                      total={colInfo.total}
                      isSelected={selectedEventId === e.id}
                      onClick={() => setSelectedEventId((prev) => (prev === e.id ? null : e.id))}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <CreateEventModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        defaultDate={weekStart}
      />
    </div>
  );
}

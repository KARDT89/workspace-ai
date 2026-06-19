import { getTenant } from "@/server/lib/tenant";
import { searchEvents, toCalendarEvent } from "@/server/db/queries/calendar";

export type { CalendarEvent } from "@/server/db/queries/calendar";

function toWeekBounds(weekStart: Date): { timeMin: string; timeMax: string } {
  const start = new Date(weekStart);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { timeMin: start.toISOString(), timeMax: end.toISOString() };
}

export async function getWeekEvents(userId: string, weekStart: Date) {
  const tenant = getTenant(userId);
  const { timeMin, timeMax } = toWeekBounds(weekStart);

  const result = await tenant.googlecalendar.api.events.getMany({
    calendarId: "primary",
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 250,
  });

  return ((result?.items ?? []) as Record<string, unknown>[])
    .filter((e) => e.status !== "cancelled")
    .map((e) => toCalendarEvent(e, (e.id as string) ?? ""));
}

export async function createEvent(
  userId: string,
  opts: {
    title: string;
    start: string;
    end: string;
    allDay?: boolean;
    attendees?: string[];
    description?: string;
    location?: string;
    sendInvite?: boolean;
  }
) {
  const tenant = getTenant(userId);

  const start = opts.allDay
    ? { date: opts.start.split("T")[0] }
    : { dateTime: opts.start };
  const end = opts.allDay
    ? { date: opts.end.split("T")[0] }
    : { dateTime: opts.end };

  const result = await tenant.googlecalendar.api.events.create({
    calendarId: "primary",
    event: {
      summary: opts.title,
      start,
      end,
      description: opts.description,
      location: opts.location,
      attendees: opts.attendees?.map((email) => ({ email })),
    },
    sendUpdates: opts.sendInvite ? "all" : "none",
  });

  return toCalendarEvent(
    result as Record<string, unknown>,
    (result as Record<string, unknown>).id as string
  );
}

export async function syncWeek(
  userId: string,
  weekStart: Date
): Promise<{ count: number }> {
  const events = await getWeekEvents(userId, weekStart);
  return { count: events.length };
}

export { searchEvents };

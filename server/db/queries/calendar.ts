import { getTenant } from "@/server/lib/tenant";

export type CalendarEvent = {
  id: string;
  entityId: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  location?: string;
  description?: string;
  attendees: { email: string; displayName?: string; responseStatus?: string }[];
  hangoutLink?: string;
  colorId?: string;
  htmlLink?: string;
};

export function toCalendarEvent(
  item: Record<string, unknown>,
  entityId: string
): CalendarEvent {
  const start = item.start as { dateTime?: string; date?: string } | undefined;
  const end = item.end as { dateTime?: string; date?: string } | undefined;
  const attendees =
    (item.attendees as {
      email?: string;
      displayName?: string;
      responseStatus?: string;
    }[]) ?? [];

  return {
    id: (item.id as string) ?? entityId,
    entityId,
    title: (item.summary as string) || "(No title)",
    start: start?.dateTime ?? start?.date ?? "",
    end: end?.dateTime ?? end?.date ?? "",
    allDay: !start?.dateTime,
    location: item.location as string | undefined,
    description: item.description as string | undefined,
    attendees: attendees.map((a) => ({
      email: a.email ?? "",
      displayName: a.displayName,
      responseStatus: a.responseStatus,
    })),
    hangoutLink: item.hangoutLink as string | undefined,
    colorId: item.colorId as string | undefined,
    htmlLink: item.htmlLink as string | undefined,
  };
}

export async function searchEvents(
  userId: string,
  q: string
): Promise<CalendarEvent[]> {
  const tenant = getTenant(userId);
  const entities = await tenant.googlecalendar.db.events.search({
    data: { summary: { contains: q } },
    limit: 20,
  });
  if (!entities?.length) return [];
  return entities.map((e) =>
    toCalendarEvent(e.data as Record<string, unknown>, e.entity_id)
  );
}

import { Calendar, MapPin, Users, Video } from "lucide-react";
import type { CalendarEvent } from "@/server/services/calendar";

function formatDateTime(iso: string, allDay: boolean): string {
  const d = new Date(iso);
  if (allDay) {
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function EventDetailPopover({ event }: { event: CalendarEvent }) {
  return (
    <div className="p-4 space-y-3">
      <h3 className="font-semibold text-base leading-tight">{event.title}</h3>

      <div className="flex items-start gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4 mt-0.5 shrink-0" />
        <div>
          <p>{formatDateTime(event.start, event.allDay)}</p>
          {event.end && (
            <p className="text-xs">→ {formatDateTime(event.end, event.allDay)}</p>
          )}
        </div>
      </div>

      {event.location && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>
      )}

      {event.hangoutLink && (
        <div className="flex items-center gap-2 text-sm">
          <Video className="h-4 w-4 shrink-0 text-muted-foreground" />
          <a
            href={event.hangoutLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Join Google Meet
          </a>
        </div>
      )}

      {event.attendees.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>
              {event.attendees.length} attendee{event.attendees.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-1 pl-5">
            {event.attendees.slice(0, 5).map((a) => (
              <div key={a.email} className="flex items-center gap-1.5 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                <span className="truncate">{a.displayName || a.email}</span>
              </div>
            ))}
            {event.attendees.length > 5 && (
              <p className="text-xs text-muted-foreground pl-3">
                +{event.attendees.length - 5} more
              </p>
            )}
          </div>
        </div>
      )}

      {event.description && (
        <p className="text-xs text-muted-foreground line-clamp-3">{event.description}</p>
      )}
    </div>
  );
}

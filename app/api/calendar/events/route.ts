import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/betterauth/session";
import { getWeekEvents, createEvent } from "@/server/services/calendar";

export async function GET(req: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const weekStartParam = searchParams.get("weekStart");
  const weekStart = weekStartParam ? new Date(weekStartParam) : new Date();

  const events = await getWeekEvents(session.user.id, weekStart);
  return NextResponse.json(events);
}

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const event = await createEvent(session.user.id, body);
  return NextResponse.json(event);
}

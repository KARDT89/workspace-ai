import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/betterauth/session";
import { searchEvents } from "@/server/services/calendar";

export async function GET(req: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  const events = await searchEvents(session.user.id, q);
  return NextResponse.json(events);
}

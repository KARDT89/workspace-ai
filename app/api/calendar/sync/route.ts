import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/betterauth/session";
import { syncWeek } from "@/server/services/calendar";

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const weekStart = body.weekStart ? new Date(body.weekStart) : new Date();

  const result = await syncWeek(session.user.id, weekStart);
  return NextResponse.json(result);
}

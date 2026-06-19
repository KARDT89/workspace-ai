import { getCurrentSession } from "@/lib/betterauth/session";
import { syncInbox } from "@/server/services/gmail";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await syncInbox(session.user.id);
  return NextResponse.json({ ok: true, synced: result.synced });
}

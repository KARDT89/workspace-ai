import { getCurrentSession } from "@/lib/betterauth/session";
import { searchInbox } from "@/server/services/gmail";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const messages = await searchInbox(session.user.id, {
    q: searchParams.get("q") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    subject: searchParams.get("subject") ?? undefined,
  });
  return NextResponse.json(messages);
}

import { getCurrentSession } from "@/lib/betterauth/session";
import { getInbox } from "@/server/services/gmail";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") ?? 50);
  const offset = Number(searchParams.get("offset") ?? 0);

  const messages = await getInbox(session.user.id, { limit, offset });
  return NextResponse.json(messages);
}

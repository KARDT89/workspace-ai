import { getCurrentSession } from "@/lib/betterauth/session";
import { getDraftsList } from "@/server/services/gmail";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const messages = await getDraftsList(session.user.id);
  return NextResponse.json(messages);
}

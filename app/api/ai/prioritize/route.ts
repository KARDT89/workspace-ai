import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/betterauth/session";
import { classifyEmailPriority } from "@/server/services/ai";

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { messageEntityId, subject, snippet, from } = body;

  if (!messageEntityId) {
    return NextResponse.json(
      { error: "messageEntityId required" },
      { status: 400 }
    );
  }

  const priority = await classifyEmailPriority(session.user.id, {
    messageEntityId,
    subject: subject ?? "",
    snippet: snippet ?? "",
    from: from ?? "",
  });

  return NextResponse.json({ priority });
}

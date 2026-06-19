import { getCurrentSession } from "@/lib/betterauth/session";
import { createDraft } from "@/server/services/gmail";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const result = await createDraft(session.user.id, {
    from: session.user.email,
    to: body.to ?? [],
    cc: body.cc,
    bcc: body.bcc,
    subject: body.subject ?? "",
    body: body.body ?? "",
    threadId: body.threadId,
  });
  return NextResponse.json(result);
}

import { getCurrentSession } from "@/lib/betterauth/session";
import { markRead } from "@/server/services/gmail";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { read } = await req.json();
  await markRead(session.user.id, id, !!read);
  return NextResponse.json({ ok: true });
}

import { getCurrentSession } from "@/lib/betterauth/session";
import { getThread } from "@/server/services/gmail";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const thread = await getThread(session.user.id, id);
  return NextResponse.json(thread);
}

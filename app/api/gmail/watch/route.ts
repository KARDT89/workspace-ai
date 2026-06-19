import { getCurrentSession } from "@/lib/betterauth/session";
import { getTenant } from "@/server/lib/tenant";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenant = getTenant(session.user.id);
  const result = await tenant.gmail.api.watch({
    topicName: process.env.GMAIL_PUBSUB_TOPIC!,
    labelIds: ["INBOX"],
  });
  return NextResponse.json(result);
}

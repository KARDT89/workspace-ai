import { processWebhook } from "corsair";
import { corsair } from "@/server/corsair";
import { db } from "@/server/db";
import { user } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { listMessages } from "@/server/db/queries/gmail";
import { classifyEmailPriority } from "@/server/services/ai";

export async function POST(req: Request) {
  const rawHeaders = Object.fromEntries(req.headers);
  const body = await req.json();

  const result = await processWebhook(corsair, rawHeaders, body);

  if (!result.plugin) return new Response(null, { status: 404 });

  // Fire-and-forget prioritization for new Gmail messages
  if (result.plugin === "gmail") {
    triggerPrioritizationFromWebhook(body).catch(() => null);
  }

  const headers = new Headers(result.responseHeaders);
  if (result.response?.returnToSender) {
    headers.set("Content-Type", "application/json");
    return new Response(JSON.stringify(result.response.returnToSender), {
      status: 200,
      headers,
    });
  }

  return new Response(null, { status: 200, headers });
}

async function triggerPrioritizationFromWebhook(
  body: unknown
): Promise<void> {
  // Gmail Pub/Sub body: { message: { data: base64({"emailAddress":"...","historyId":"..."}) } }
  const pubsub = body as { message?: { data?: string } };
  const encodedData = pubsub?.message?.data;
  if (!encodedData) return;

  let emailAddress: string;
  try {
    const decoded = JSON.parse(
      Buffer.from(encodedData, "base64").toString("utf-8")
    );
    emailAddress = decoded.emailAddress;
    if (!emailAddress) return;
  } catch {
    return;
  }

  const users = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, emailAddress))
    .limit(1);
  if (!users.length) return;

  const userId = users[0].id;
  const messages = await listMessages(userId, { limit: 10 });
  const unprioritized = messages.filter((m) => !m.priority);

  for (const m of unprioritized) {
    await classifyEmailPriority(userId, {
      messageEntityId: m.entityId,
      subject: m.subject,
      snippet: m.snippet,
      from: m.from,
    });
  }
}

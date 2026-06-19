import { processWebhook } from "corsair";
import { corsair } from "@/server/corsair";
import { db } from "@/server/db";
import { user } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { listMessages } from "@/server/db/queries/gmail";
import { syncInbox } from "@/server/services/gmail";
import { classifyEmailPriority } from "@/server/services/ai";
import { notifyUser } from "@/lib/sse";

export async function POST(req: Request) {
  const rawHeaders = Object.fromEntries(req.headers);
  const body = await req.json();

  const result = await processWebhook(corsair, rawHeaders, body);

  if (!result.plugin) return new Response(null, { status: 404 });

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

async function triggerPrioritizationFromWebhook(body: unknown): Promise<void> {
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

  // Sync from Gmail API → guarantees new message is in corsair_entities
  await syncInbox(userId);

  // Push SSE event so the browser refetches immediately
  notifyUser(userId);

  // Classify priorities for any unprocessed messages
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

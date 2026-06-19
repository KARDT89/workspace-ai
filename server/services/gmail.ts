import { getTenant } from "@/server/lib/tenant";
import { buildRawMessage } from "@/server/lib/email-encoding";
import { listMessages, searchMessages } from "@/server/db/queries/gmail";

export type { InboxMessage } from "@/server/db/queries/gmail";

type MessagePart = {
  mimeType?: string;
  body?: { data?: string; size?: number; attachmentId?: string };
  parts?: MessagePart[];
  headers?: { name?: string; value?: string }[];
};

export type ThreadMessage = {
  id: string;
  from: string;
  to: string;
  cc: string;
  subject: string;
  date: string;
  labelIds: string[];
  unread: boolean;
  body: string;
  isHtml: boolean;
};

export type Thread = {
  id: string;
  snippet: string;
  messages: ThreadMessage[];
};

type SendOpts = {
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  replyToMessageId?: string;
  references?: string;
  threadId?: string;
};

function decodeBase64Url(data: string): string {
  const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(base64, "base64").toString("utf-8");
}

function extractBody(part: MessagePart): { html: string | null; text: string | null } {
  if (part.mimeType === "text/html" && part.body?.data) {
    return { html: decodeBase64Url(part.body.data), text: null };
  }
  if (part.mimeType === "text/plain" && part.body?.data) {
    return { html: null, text: decodeBase64Url(part.body.data) };
  }
  if (part.parts?.length) {
    let html: string | null = null;
    let text: string | null = null;
    for (const sub of part.parts) {
      const r = extractBody(sub);
      if (r.html && !html) html = r.html;
      if (r.text && !text) text = r.text;
    }
    return { html, text };
  }
  return { html: null, text: null };
}

function getHeader(headers: { name?: string; value?: string }[], name: string): string {
  return (
    headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? ""
  );
}

export async function getInbox(userId: string, opts?: { limit?: number; offset?: number }) {
  return listMessages(userId, opts);
}

export async function getThread(userId: string, threadId: string): Promise<Thread> {
  const tenant = getTenant(userId);
  const result = await tenant.gmail.api.threads.get({ id: threadId });

  const messages: ThreadMessage[] = (result.messages ?? []).map((msg) => {
    const headers = msg.payload?.headers ?? [];
    const body = extractBody((msg.payload ?? {}) as MessagePart);
    const labelIds = msg.labelIds ?? [];
    return {
      id: msg.id ?? "",
      from: getHeader(headers, "from"),
      to: getHeader(headers, "to"),
      cc: getHeader(headers, "cc"),
      subject: getHeader(headers, "subject"),
      date: getHeader(headers, "date"),
      labelIds,
      unread: labelIds.includes("UNREAD"),
      body: body.html ?? body.text ?? "(no content)",
      isHtml: !!body.html,
    };
  });

  return {
    id: result.id ?? threadId,
    snippet: result.snippet ?? "",
    messages,
  };
}

export async function searchInbox(
  userId: string,
  filters: { q?: string; from?: string; subject?: string }
) {
  return searchMessages(userId, filters);
}

export async function sendMessage(userId: string, opts: SendOpts) {
  const tenant = getTenant(userId);
  const raw = buildRawMessage(opts);
  return tenant.gmail.api.messages.send({
    raw,
    ...(opts.threadId ? { threadId: opts.threadId } : {}),
  });
}

export async function createDraft(userId: string, opts: SendOpts) {
  const tenant = getTenant(userId);
  const raw = buildRawMessage(opts);
  return tenant.gmail.api.drafts.create({
    draft: {
      message: {
        raw,
        ...(opts.threadId ? { threadId: opts.threadId } : {}),
      },
    },
  });
}

export async function sendDraft(userId: string, draftId: string) {
  const tenant = getTenant(userId);
  return tenant.gmail.api.drafts.send({ id: draftId });
}

export async function markRead(userId: string, messageId: string, read: boolean) {
  const tenant = getTenant(userId);
  return tenant.gmail.api.messages.modify({
    id: messageId,
    addLabelIds: read ? [] : ["UNREAD"],
    removeLabelIds: read ? ["UNREAD"] : [],
  });
}

export async function syncInbox(userId: string) {
  const tenant = getTenant(userId);

  const list = await tenant.gmail.api.messages.list({
    maxResults: 50,
    labelIds: ["INBOX"],
  });
  const messages = list.messages ?? [];

  await Promise.all(
    messages.map(async (msg) => {
      if (!msg.id) return;
      const full = await tenant.gmail.api.messages.get({
        id: msg.id,
        format: "metadata",
        metadataHeaders: ["From", "To", "Subject"],
      });
      const headers: { name?: string; value?: string }[] =
        (full.payload as { headers?: { name?: string; value?: string }[] })?.headers ?? [];
      const h = (name: string) =>
        headers.find((hdr) => hdr.name?.toLowerCase() === name)?.value ?? "";

      await tenant.gmail.db.messages.upsertByEntityId(msg.id, {
        id: msg.id,
        threadId: full.threadId,
        labelIds: full.labelIds,
        snippet: full.snippet,
        internalDate: full.internalDate != null
          ? new Date(full.internalDate as string | number | Date).getTime().toString()
          : undefined,
        from: h("from"),
        to: h("to"),
        subject: h("subject"),
      });
    })
  );

  return { synced: messages.length };
}

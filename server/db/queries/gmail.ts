import { db } from "@/server/db";
import { emailPriorities } from "@/server/db/schema";
import { getTenant } from "@/server/lib/tenant";
import { inArray } from "drizzle-orm";

export type InboxMessage = {
  entityId: string;
  messageId: string;
  threadId: string;
  from: string;
  subject: string;
  snippet: string;
  internalDate: string;
  labelIds: string[];
  unread: boolean;
  priority?: "high" | "medium" | "low";
};

function toInboxMessage(
  entity: { entity_id: string; data: Record<string, unknown> },
  priorityMap: Map<string, { priority: string }>
): InboxMessage {
  const d = entity.data;
  const labelIds = (d.labelIds as string[]) ?? [];
  const prio = priorityMap.get(entity.entity_id);
  return {
    entityId: entity.entity_id,
    messageId: (d.id as string) ?? "",
    threadId: (d.threadId as string) ?? entity.entity_id,
    from: (d.from as string) ?? "",
    subject: (d.subject as string) || "(no subject)",
    snippet: (d.snippet as string) ?? "",
    internalDate: (d.internalDate as string) ?? "",
    labelIds,
    unread: labelIds.includes("UNREAD"),
    priority: prio?.priority as "high" | "medium" | "low" | undefined,
  };
}

export async function listMessages(
  userId: string,
  opts: { limit?: number; offset?: number } = {}
): Promise<InboxMessage[]> {
  const tenant = getTenant(userId);
  const { limit = 50, offset = 0 } = opts;

  const entities = await tenant.gmail.db.messages.list({ limit, offset });
 
  if (!entities?.length) return [];
  // Dedupe by threadId — keep first occurrence (newest first from Corsair)
  const seen = new Set<string>();
  const deduped: typeof entities = [];
  for (const e of entities) {
    const tid = (e.data?.threadId as string) ?? e.entity_id;
    if (!seen.has(tid)) {
      seen.add(tid);
      deduped.push(e);
    }
  }

  const entityIds = deduped.map((e) => e.entity_id);
  const priorities = entityIds.length
    ? await db
        .select()
        .from(emailPriorities)
        .where(inArray(emailPriorities.messageEntityId, entityIds))
    : [];
  const priorityMap = new Map(priorities.map((p) => [p.messageEntityId, p]));

  return deduped.map((e) =>
    toInboxMessage(e as { entity_id: string; data: Record<string, unknown> }, priorityMap)
  );
}

export async function searchMessages(
  userId: string,
  filters: { q?: string; from?: string; subject?: string }
): Promise<InboxMessage[]> {
  const tenant = getTenant(userId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dataFilter: Record<string, any> = {};
  if (filters.from) dataFilter.from = { contains: filters.from };
  if (filters.subject) dataFilter.subject = { contains: filters.subject };
  if (filters.q) dataFilter.snippet = { contains: filters.q };

  const entities = await tenant.gmail.db.messages.search({
    ...(Object.keys(dataFilter).length ? { data: dataFilter } : {}),
    limit: 50,
  });

  if (!entities?.length) return [];

  const entityIds = entities.map((e) => e.entity_id);
  const priorities = await db
    .select()
    .from(emailPriorities)
    .where(inArray(emailPriorities.messageEntityId, entityIds));
  const priorityMap = new Map(priorities.map((p) => [p.messageEntityId, p]));

  return entities.map((e) =>
    toInboxMessage(e as { entity_id: string; data: Record<string, unknown> }, priorityMap)
  );
}

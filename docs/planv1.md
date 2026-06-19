# Execution Plan: Corsair Hub — Superhuman Clone

## Context

Building a keyboard-first Gmail + Google Calendar client powered entirely by Corsair integrations. The PRD is at `docs/PRD.md`. Stack: Next.js 15 App Router, Drizzle + PostgreSQL, Better Auth, Corsair, TanStack Query, shadcn/ui, OpenRouter.

**Current state of the repo:**
- Corsair already configured: `server/corsair.ts` with `gmail` + `googlecalendar` plugins, `multiTenancy: true`
- Better Auth set up with Google + GitHub + email/password
- DB: `corsair_accounts.tenant_id → user.id` — Better Auth user ID = Corsair tenant ID
- `@openai/agents` + `@corsair-dev/mcp` installed
- OpenRouter key in `.env`; ngrok tunnel + Gmail Pub/Sub topic configured
- No `server/lib/`, `server/services/`, `server/db/queries/` directories yet
- No `app/api/` routes yet
- No mail/calendar UI yet

**Constraint:** No tRPC. All data fetching via Next.js App Router API routes + TanStack Query on client.

---

## Pre-work (do before any phase)

**Step 0 — Discover Corsair endpoints (do this first, never guess)**
```bash
pnpm corsair list                             # all live API endpoints
pnpm corsair list --type db                   # DB entity types
pnpm corsair schema gmail.api.messages.send   # exact input for send
pnpm corsair schema gmail.db.messages.search  # filter fields
pnpm corsair schema googlecalendar.api.events.create
pnpm corsair schema googlecalendar.db.events.list
```
Save the output — all service layer code must match these exact signatures.

**Step 0b — Verify schema directory**
Check `server/db/schema/` structure. Confirm `drizzle.config.ts` schema path. Understand what schema files currently exist before adding new ones.

---

## Phase 1 — Foundation

**Goal:** User can sign in, connect Gmail + Calendar via Corsair OAuth, webhook endpoint is live.

### Step 1 — New Drizzle schemas

Create three new files in `server/db/schema/`:

**`server/db/schema/email-priorities.ts`**
```typescript
export const emailPriorities = pgTable("email_priorities", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  messageEntityId: text("message_entity_id").notNull(),
  priority: text("priority").notNull(), // 'high' | 'medium' | 'low'
  reasoning: text("reasoning"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [uniqueIndex("email_priorities_user_message_idx").on(t.userId, t.messageEntityId)])
```

**`server/db/schema/user-preferences.ts`**
```typescript
export const userPreferences = pgTable("user_preferences", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  uiConfig: jsonb("ui_config").default({}).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
```

**`server/db/schema/agent-conversations.ts`**
```typescript
export const agentConversations = pgTable("agent_conversations", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  messages: jsonb("messages").default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
```

Export all three from `server/db/schema/index.ts`.

Run:
```bash
pnpm db:generate   # generates migration SQL
pnpm db:migrate    # applies to local DB
```

**Verify:** `pnpm db:studio` shows the three new tables.

---

### Step 2 — Tenant helper

Create `server/lib/tenant.ts`:
```typescript
import { corsair } from "@/server/corsair"

export function getTenant(userId: string) {
  return corsair.withTenant(userId)
}
```

This is the single entry point for all Corsair calls throughout the app.

---

### Step 3 — Email encoding utility

Create `server/lib/email-encoding.ts` with:
- `buildRawMessage({ from, to, cc, bcc, subject, body, replyToMessageId?, references? }): string`
  - Builds RFC 2822 MIME string with `\r\n` line endings
  - base64url encodes (`+`→`-`, `/`→`_`, strip `=`)
- `parseEmailAddress(raw: string): { name: string, email: string }`
  - Parses `"Name <email@example.com>"` format

---

### Step 4 — App shell layout

Create `app/(app)/layout.tsx` — the authenticated app wrapper:
- Three-column flex layout: nav rail (64px) + list panel (320px) + detail panel (flex-1)
- Nav rail: Mail, Calendar, Agent, Settings icons (Phosphor Icons)
- Active section highlighted with accent blue
- Uses `getCurrentSession()` — redirects to `/login` if no session
- Checks middleware for Corsair connection (see Step 6)

Create the placeholder pages:
- `app/(app)/mail/page.tsx`
- `app/(app)/calendar/page.tsx`
- `app/(app)/agent/page.tsx`

---

### Step 5 — Corsair connection flow

**Investigate first:** Run `pnpm corsair list` and check if Corsair exposes an auth URL API for programmatic OAuth initiation (needed for multi-user web app, CLI won't work per user).

Create `app/connect/page.tsx`:
- Server Component; calls `getCurrentSession()` → redirect to `/login` if not authed
- Queries `db.select().from(corsairAccounts).where(eq(corsairAccounts.tenantId, session.user.id))`
- Shows connection cards: Gmail and Google Calendar, each with status + connect/reconnect button
- "Continue to app" button (enabled when both connected) → navigates to `/mail`

Create `app/api/corsair/auth/route.ts`:
- `GET` with query param `plugin=gmail|googlecalendar`
- Generates Corsair OAuth URL for the authenticated user's tenant
- Redirects user to Google OAuth

Create `app/api/corsair/callback/route.ts`:
- Handles OAuth callback from Corsair
- Redirects back to `/connect`

---

### Step 6 — Middleware

Create `middleware.ts` at project root:
- Protect `/mail`, `/calendar`, `/agent` — require Better Auth session
- If authed but no Corsair accounts connected → redirect to `/connect`
- Use Better Auth session check + DB query on `corsair_accounts`

---

### Step 7 — Webhook handler

Create `app/api/webhooks/route.ts`:
```typescript
import { processWebhook } from "corsair"
import { corsair } from "@/server/corsair"

export async function POST(req: Request) {
  const headers = Object.fromEntries(req.headers)
  const body = await req.json()
  
  const result = await processWebhook(corsair, headers, body, {
    tenantId: process.env.TENANT_ID ?? "dev",
  })
  
  if (!result) return new Response(null, { status: 404 })
  
  // After webhook processed: trigger AI prioritization for new messages
  // (wired in Phase 4)
  
  return result.response
}
```

**Verify Phase 1:** Sign in → see `/connect` page → click "Connect Gmail" → complete OAuth → see "Connected ✓" → click "Continue" → land on `/mail`.

---

## Phase 2 — Email Core

**Goal:** Read inbox, open threads, compose and send email, create and send drafts.

### Step 8 — Gmail query layer

Create `server/db/queries/gmail.ts`:
- `listMessages(db, userId, { limit, offset, view })` — queries `corsair_entities` via Corsair DB, dedupes by `entity_id` (keep latest `updated_at`), joins `email_priorities` for priority badges
- `getMessage(db, entityId)` — single message from cache
- `searchMessages(db, userId, filters)` — search via Corsair DB search API

### Step 9 — Gmail service layer

Create `server/services/gmail.ts`:
- `getInbox(userId, opts)` → calls Corsair `gmail.db.messages.list()`, deduplicates, merges priority data
- `getMessage(userId, entityId)` → cache-first, falls back to `gmail.api.messages.get`
- `searchMessages(userId, query, filters)` → `gmail.db.messages.search()`
- `sendMessage(userId, { to, cc, bcc, subject, body, replyToMessageId })` → builds RFC 2822, calls `gmail.api.messages.send()`
- `createDraft(userId, fields)` → `gmail.api.drafts.create()`
- `sendDraft(userId, draftId)` → `gmail.api.drafts.send()`
- `syncInbox(userId)` → `gmail.api.threads.list({ maxResults: 50 })`
- `markRead(userId, messageId, read)` → `gmail.api.messages.modify()`

### Step 10 — Gmail API routes

Create under `app/api/gmail/`:
- `messages/route.ts` — `GET` → `gmailService.getInbox()`
- `messages/[id]/route.ts` — `GET` → `gmailService.getMessage()`
- `messages/search/route.ts` — `GET` → `gmailService.searchMessages()`
- `messages/send/route.ts` — `POST` → `gmailService.sendMessage()`
- `messages/[id]/read/route.ts` — `PATCH` → `gmailService.markRead()`
- `drafts/route.ts` — `POST` → `gmailService.createDraft()`
- `drafts/[id]/send/route.ts` — `POST` → `gmailService.sendDraft()`
- `sync/route.ts` — `POST` → `gmailService.syncInbox()`

All routes: get session via `getCurrentSession()`, return 401 if missing, pass `session.user.id` to service.

### Step 11 — Inbox UI

Create `components/mail/thread-list.tsx` (Client Component):
- Renders list of thread rows
- Each row: unread dot, avatar initials, sender name (bold if unread), subject, snippet, timestamp, priority badge
- Row height 68px, hover bg lift, active left border
- Uses TanStack Query: `useQuery({ queryKey: ['inbox'], queryFn: () => fetch('/api/gmail/messages').then(r => r.json()) })`
- Selected thread stored in URL param (`?thread=<id>`) or local state

Create `components/mail/thread-row.tsx` — single row component

Wire into `app/(app)/mail/page.tsx` as the center (list) panel.

### Step 12 — Thread detail UI

Create `components/mail/thread-detail.tsx` (Client Component):
- Header: sender name + email, recipients (collapsible), timestamp
- Message list: all messages in thread, collapsed except latest
- Each collapsed message: one-liner with sender + subject + date
- Each expanded message: full body (sandboxed iframe for HTML, formatted text for plain)
- Reply toolbar at bottom: Reply, Reply All, Forward, Archive, Delete
- Marks thread read on open (calls `PATCH /api/gmail/messages/[id]/read`)

### Step 13 — Compose window

Create `components/mail/compose-window.tsx` (Client Component):
- Fixed position bottom-right, 400×480px
- Fields: To (tag input), Cc/Bcc (toggled), Subject, Body (rich text with bold/italic/list/code)
- `Cmd+Enter` → sends via `POST /api/gmail/messages/send`
- `Cmd+Shift+D` → saves draft via `POST /api/gmail/drafts`
- `Escape` → prompts draft save if dirty, then closes
- Toggle `Cmd+Shift+F` for full-screen mode
- Minimise button collapses to tab

**Verify Phase 2:** Load inbox from cache → click thread → read full email → press `c` → compose → `Cmd+Enter` → email sent → appears in Sent after sync.

---

## Phase 3 — Calendar Core

**Goal:** See week view, view events, create events, send invites.

### Step 14 — Calendar query + service layer

Create `server/db/queries/calendar.ts`:
- `listEvents(db, userId, { weekStart })` — queries Corsair DB for events in week range, dedupes by `entity_id`

Create `server/services/calendar.ts`:
- `getWeekEvents(userId, weekStart: Date)` → `googlecalendar.db.events.list()` with `timeMin`/`timeMax` for Mon–Sun of that week
- `createEvent(userId, { title, start, end, attendees, description, sendInvite })` → `googlecalendar.api.events.create()` with `sendUpdates: sendInvite ? 'all' : 'none'`
- `syncWeek(userId, weekStart)` → `googlecalendar.api.events.getMany()` with week range

### Step 15 — Calendar API routes

Create under `app/api/calendar/`:
- `events/route.ts` — `GET` (query: `weekStart`) + `POST` (create event)
- `events/search/route.ts` — `GET` (query: `q`)
- `sync/route.ts` — `POST` → `calendarService.syncWeek()`

### Step 16 — Week view UI

Create `components/calendar/week-view.tsx` (Client Component):
- Time grid: 7 columns (Mon–Sun), 24 hour rows, default scroll to 7am
- Column headers: "Mon 16", today circled in accent
- All-day event banner row above grid
- Event blocks: colored, 4px rounded corners, title + time
- Overlapping events: side-by-side within column
- `[` / `]` keys navigate weeks; "Today" button jumps to current week
- Uses TanStack Query with `weekStart` as query key

Create `components/calendar/event-block.tsx` — single event positioned by CSS top/height from start/end times

Create `components/calendar/event-detail-popover.tsx` — popover on event click: title, time, attendees (avatars + names), description, Edit/Delete buttons

### Step 17 — Create event modal

Create `components/calendar/create-event-modal.tsx` (Client Component):
- Fields: Title, Date + Start/End time, Attendees (multi-email), Description + Location (expandable)
- "Notify attendees" toggle (on by default)
- Submit → `POST /api/calendar/events`
- Triggered by `n` key in calendar view or "New Event" button

**Verify Phase 3:** Navigate to Calendar → see current week events from cache → press `n` → create event with attendee → attendee receives Google Calendar invite.

---

## Phase 4 — Real-time & AI

**Goal:** New emails arrive automatically. All inbox emails have priority badges.

### Step 18 — Wire webhook to frontend

Update `app/api/webhooks/route.ts`:
- After `processWebhook()` succeeds for a Gmail message event:
  - Extract new message entity from webhook payload
  - Call `POST /api/ai/prioritize` internally (or call the service directly)
- Frontend: add `refetchInterval: 30_000` to inbox TanStack Query as polling fallback

### Step 19 — AI prioritization

Create `server/services/ai.ts`:
- `classifyEmailPriority(userId, { messageEntityId, subject, snippet, from }): Promise<'high'|'medium'|'low'>`
- Calls OpenRouter (`OPENROUTER_CLASSIFIER_MODEL` env, e.g. `google/gemini-flash-1.5-8b`)
- Prompt: classify as high/medium/low with one-sentence reasoning
- On success: upserts into `email_priorities` table
- On failure: silently defaults to `medium`

Create `app/api/ai/prioritize/route.ts`:
- `POST` → validates body → calls `ai.classifyEmailPriority()`

### Step 20 — Backfill existing inbox

On first load, if inbox messages have no priority rows, trigger prioritization for the latest 50. Show skeleton badges while pending.

### Step 21 — Priority badges in UI

Update `components/mail/thread-row.tsx`:
- `high` → amber badge "⚡ High"
- `low` → muted gray "Low" (hover only)
- `medium` → no badge

Update inbox list API route to JOIN `email_priorities` and return priority with each message.

**Verify Phase 4:** Send yourself a test email → appears in inbox within 5 seconds → priority badge shows.

---

## Phase 5 — Search & Keyboard Shortcuts

**Goal:** Fast search across email + calendar. All keyboard shortcuts working.

### Step 22 — Search API routes

Update `app/api/gmail/messages/search/route.ts`:
- Accept query params: `q`, `from`, `subject`, `priority`, `dateAfter`, `dateBefore`
- Build Corsair DB search filters from params
- Return deduplicated results

Update `app/api/calendar/events/search/route.ts`:
- Accept `q` → search event titles + descriptions in Corsair DB

### Step 23 — Global search UI

Create `components/search/search-bar.tsx` (Client Component):
- Fixed at top of list panel
- `/` key focuses it globally
- `Escape` clears + returns to inbox
- Free-text input + filter chip row below: From, Subject, Date range, Priority
- Debounced 300ms → calls search API → renders results in list panel
- Search history (last 10) in localStorage

### Step 24 — Keyboard shortcuts hook

Create `hooks/use-keyboard-shortcuts.ts`:
- Takes a `shortcuts: Record<string, () => void>` map
- Registers `keydown` listener, respects active element (ignores when in input/textarea)
- Handles two-key sequences (`g m`, `g c`, `g a`)
- Returns cleanup on unmount

Wire shortcuts into the app shell and individual view components per PRD §15:
- Global: `?`, `g m`, `g c`, `g a`, `/`, `Escape`
- Mail list: `j`, `k`, `Enter`, `c`, `e`, `#`, `u`, `r`
- Thread detail: `r`, `a`, `f`, `e`, `[`, `]`
- Compose: handled inside compose component
- Calendar: `n`, `[`, `]`, `t`

### Step 25 — Shortcuts cheat sheet

Create `components/shortcuts-modal.tsx`:
- Dialog triggered by `?` key
- Shows all shortcuts in grouped sections matching PRD §15
- Uses `<kbd>` elements for key display

**Verify Phase 5:** Press `/` → type sender name → see filtered results. Press `j`/`k` → navigate threads. Press `?` → see cheat sheet.

---

## Phase 6 — Agent Chat

**Goal:** Natural language commands execute real email + calendar actions.

### Step 26 — Investigate Corsair MCP API

Before writing any agent code:
```bash
pnpm corsair list   # verify all tools exposed via MCP
```
Check `@corsair-dev/mcp` package exports — understand how to initialize the MCP server with a tenant-scoped Corsair instance.

### Step 27 — Agent conversation queries + service

Create `server/db/queries/agent-conversations.ts`:
- `getConversation(db, id)` — fetch messages array
- `createConversation(db, userId)` — insert new row
- `appendMessage(db, id, message)` — append to messages jsonb array

Create `server/services/agent.ts`:
- `runAgentTurn(userId, conversationId, message)` — initializes OpenAI Agent with Corsair MCP tools attached, runs one turn, appends messages to DB, returns async iterator for SSE

### Step 28 — Agent SSE route

Create `app/api/agent/chat/route.ts`:
- `POST` → authenticate → parse `{ message, conversationId? }`
- If no `conversationId`, create new conversation
- Call `agentService.runAgentTurn()` which returns SSE stream
- Return `new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } })`

### Step 29 — Agent chat UI

Create `components/agent/chat-panel.tsx` (Client Component):
- Full detail-panel chat interface
- Message history scrollable, input fixed at bottom
- User messages right-aligned, agent messages left-aligned
- Markdown rendering for agent messages
- When agent performs action → render action confirmation card inline: "✉️ Sent email to alex@company.com — 'Q3 sync'"
- SSE client reads stream, appends tokens to last agent message as they arrive
- "New conversation" button creates fresh conversation

Wire into `app/(app)/agent/page.tsx`.

**Verify Phase 6:** Open agent → type "What emails do I have from this week?" → see real emails listed. Type "Send an email to [real test email] saying hello" → confirm email delivered.

---

## Phase 7 — Polish

**Goal:** Production-ready error handling, empty states, loading states, toasts.

### Step 30 — Loading skeletons

Add skeleton states to:
- Thread list (5 rows of gray shimmer blocks)
- Thread detail (header + body shimmer)
- Calendar week view (gray event block placeholders)
- Agent chat (typing indicator)

### Step 31 — Empty states

- Inbox empty: "All clear. Press `c` to compose."
- Search no results: "No messages matching '[query]'"
- Calendar week empty: "No events this week. Press `n` to create one."
- Agent no conversation: "Start a conversation. Try: 'What's on my calendar tomorrow?'"

### Step 32 — Toast notifications

Use Sonner (already installed) for:
- Email sent: "Message sent" (auto-dismiss 3s)
- Draft saved: "Draft saved"
- Event created: "Event created — invites sent"
- Sync complete: "Inbox synced"
- Error on send/create: "Failed to send — [error]" (persistent, with retry)

### Step 33 — Settings page

Create `app/(app)/settings/page.tsx`:
- Section: Connected integrations (with disconnect button per integration)
- Section: Account info (name, email from Better Auth session)
- Section: Keyboard shortcuts (link to open `?` modal)

---

## File Tree Summary

```
server/
  lib/
    tenant.ts              # getTenant(userId)
    email-encoding.ts      # buildRawMessage, parseEmailAddress
  db/
    schema/
      email-priorities.ts
      user-preferences.ts
      agent-conversations.ts
      index.ts             # re-exports all schemas
    queries/
      gmail.ts
      calendar.ts
      agent-conversations.ts
  services/
    gmail.ts
    calendar.ts
    ai.ts
    agent.ts

app/
  (app)/
    layout.tsx             # three-panel shell + auth guard
    mail/page.tsx
    calendar/page.tsx
    agent/page.tsx
    settings/page.tsx
  connect/page.tsx
  api/
    corsair/
      auth/route.ts
      callback/route.ts
    gmail/
      messages/route.ts
      messages/[id]/route.ts
      messages/[id]/read/route.ts
      messages/search/route.ts
      messages/send/route.ts
      drafts/route.ts
      drafts/[id]/send/route.ts
      sync/route.ts
    calendar/
      events/route.ts
      events/search/route.ts
      sync/route.ts
    webhooks/route.ts
    ai/
      prioritize/route.ts
    agent/
      chat/route.ts

components/
  mail/
    thread-list.tsx
    thread-row.tsx
    thread-detail.tsx
    compose-window.tsx
  calendar/
    week-view.tsx
    event-block.tsx
    event-detail-popover.tsx
    create-event-modal.tsx
  agent/
    chat-panel.tsx
  search/
    search-bar.tsx
  shortcuts-modal.tsx

hooks/
  use-keyboard-shortcuts.ts

middleware.ts
```

---

## Verification Checklist

After each phase, verify:

| Phase | Check |
|---|---|
| 1 | Sign in → `/connect` → connect Gmail → connect Calendar → land on `/mail` |
| 2 | Inbox loads in < 200ms → open thread → compose → `Cmd+Enter` → email sent |
| 3 | Calendar week view → event detail → create event → attendee receives invite |
| 4 | Send self email → appears in inbox < 5s → has priority badge |
| 5 | `/` → search → filter by sender → results correct. All shortcuts fire. |
| 6 | "Send email to X saying Y" → email actually delivered |
| 7 | All error states, empty states, toasts rendering correctly |

Run after each phase:
```bash
pnpm lint
pnpm build
```

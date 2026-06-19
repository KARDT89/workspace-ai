# Product Requirements Document
## Corsair Hub — Superhuman Clone + Universal Integration Layer

**Version:** 1.0  
**Date:** 2026-06-19  
**Status:** Draft

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Problem Statement](#2-problem-statement)
3. [Target Audience](#3-target-audience)
4. [Long-term Vision](#4-long-term-vision)
5. [Phase 1 Scope — Superhuman Clone](#5-phase-1-scope--superhuman-clone)
6. [Feature Specifications](#6-feature-specifications)
7. [Technical Stack](#7-technical-stack)
8. [Architecture & Data Flow](#8-architecture--data-flow)
9. [Data Models](#9-data-models)
10. [API Route Design](#10-api-route-design)
11. [UI / UX Design](#11-ui--ux-design)
12. [Corsair Connection Flow](#12-corsair-connection-flow)
13. [AI Email Prioritization](#13-ai-email-prioritization)
14. [Agent Chat](#14-agent-chat)
15. [Keyboard Shortcuts](#15-keyboard-shortcuts)
16. [Development Phases](#16-development-phases)
17. [Future Integrations](#17-future-integrations)
18. [Technical Challenges & Mitigations](#18-technical-challenges--mitigations)
19. [Environment Variables](#19-environment-variables)

---

## 1. Product Vision

Most people's most important professional tools are their inbox and their calendar. Yet the interfaces for these — Gmail, Google Calendar, Outlook — are designed to serve the broadest possible audience, not any one person's specific workflow. A product like Superhuman proved there is massive demand for a faster, cleaner email experience. But even Superhuman is still someone else's opinion of how your workflow should look.

**Corsair Hub** is a different bet: give developers and power users an email and calendar interface that is *entirely theirs*, built on top of Corsair's integration primitives. Because Corsair provides the raw plumbing — live API access, a local database cache, real-time webhooks, and an MCP server for agents — this app is free to make radical UI and workflow decisions that no commercial product would risk for their general audience.

The North Star is: **your communication workflow, exactly as you need it, with no ceiling on what you can change.**

Phase 1 ships a polished, keyboard-first Superhuman clone for Gmail and Google Calendar. Phase 2 and beyond expands to every integration Corsair offers — Slack, Linear, GitHub, Notion, and whatever comes next — creating a single unified control surface over all the tools that drive your work.

---

## 2. Problem Statement

### For email
- Gmail's UI is cluttered and optimized for general users, not power users
- Third-party clients (Superhuman, HEY, Spark) impose their own workflow opinions
- No existing product lets you customize exactly what is prominent, what is hidden, and how you navigate
- Switching between reading email and acting on it (scheduling, replying) requires too many context switches

### For calendar
- Google Calendar is hard to use quickly — creating a meeting with a specific person requires many clicks
- There is no natural-language way to say "find a time with Alice next Thursday and send the invite"
- Calendar and email are separate interfaces even though they are tightly related workflows

### For integration power users
- Every tool you use (Linear, Slack, GitHub) has its own notification surface with no unified view
- Agent-based assistants (ChatGPT, Copilot) can talk about your data but can't actually act on it across your tools
- Building custom integrations requires auth, rate-limit handling, caching, and webhook infrastructure — Corsair already solves all of this, but there is no ready-made UI on top of it

---

## 3. Target Audience

**Primary: Developer / solo operator**
A developer or technical founder who spends a significant part of their day in email and calendar. They are comfortable with customizing their tools and have an opinion about their workflow. They are the person who reads about Superhuman and thinks "I'd build it differently." They run this app locally or self-host it.

**Secondary: Small technical team**
A small startup team (2–10 people) that wants a shared, opinionated communication tool they own and can extend. They connect their own Google Workspace accounts and deploy this on their own infrastructure.

**Not targeted in Phase 1:** General consumers, non-technical users, people who want a zero-configuration product.

---

## 4. Long-term Vision

Phase 1 ships email + calendar. But the architecture is designed from day one to support every Corsair integration.

The long-term product is a **unified control layer for every tool you use at work.** Think of it as an operating system for your professional communication and task management, where:

- Every integration has a purpose-built UI module (not a generic "app grid")
- A single agent chat window can act across all connected tools: "Create a Linear ticket for the bug Alex mentioned in email yesterday, assign it to me, and reply to Alex with the ticket link"
- A unified activity feed surfaces what matters across all channels, ranked by actual importance (not recency)
- Power users can compose custom "views" — a pane that shows your email + the Linear board for the project you're currently working on + your calendar for the day

Corsair is the infrastructure layer that makes all of this possible without building auth, caching, and webhook handlers for each integration from scratch.

---

## 5. Phase 1 Scope — Superhuman Clone

Phase 1 ships a fully functional, keyboard-driven email and calendar client.

### In scope
- Gmail inbox: thread list, thread detail, compose, reply, draft, send, archive, search
- Google Calendar: week view, event detail, create event, send invite
- Real-time updates via Corsair webhooks (no polling)
- AI email prioritization using a cheap LLM
- Keyboard shortcuts for all common actions
- Advanced search powered by Corsair's search API
- Agent chat: natural language email and calendar actions via Corsair MCP

### Out of scope for Phase 1
- Labels and filters management UI
- Email templates
- Multiple Google accounts per user
- Mobile layout (desktop-first)
- Notification system (browser notifications, sounds)
- Calendar: recurring events, multi-day events, availability checking

---

## 6. Feature Specifications

### 6.1 Gmail — Inbox

**Goal:** A fast, readable list of email threads that loads from the local Corsair DB cache.

**Behavior:**
- Displays threads sorted by most recent message, newest first
- Each row shows: sender name, subject, snippet, timestamp, AI priority badge (High / Normal / Low), unread indicator
- Unread threads are visually distinct (bold subject, accent color left border)
- Threads are deduplicated by `entity_id`; only the latest `updated_at` row is shown
- Pagination: load 50 threads at a time, infinite scroll or "Load more" button
- A "Sync" button triggers a live refresh from Gmail API and updates the cache
- Default view is "All Mail"; sidebar navigation switches between Inbox, Sent, Drafts

**Acceptance criteria:**
- Page load reads from DB cache via `GET /api/gmail/messages` in under 200ms
- Sync button calls `POST /api/gmail/sync` and refreshes the list
- Unread count badge in sidebar updates after sync
- No direct calls to Google APIs from the frontend — all through Corsair

---

### 6.2 Gmail — Thread View

**Goal:** Read a full email thread in a clean, focused reading pane.

**Behavior:**
- Clicking a thread opens the detail pane (right panel) without navigating away
- Shows all messages in the thread, collapsed by default except the latest
- Each message shows: sender full name + email, recipient(s), timestamp (formatted as "Today, 3:45 PM" or "Jun 12" for older), full body
- Attachments listed at the bottom of each message (name + download link)
- "Reply" and "Reply All" buttons open the inline composer within the thread view
- "Forward" opens the composer pre-filled with forwarded content
- HTML emails are rendered in a sandboxed iframe; plain-text emails rendered as formatted text

**Acceptance criteria:**
- Read full message from DB cache first (`gmail.db.messages.findByEntityId`); fall back to `gmail.api.messages.get` if body is missing
- Clicking a thread marks it read (calls `gmail.api.messages.modify` to remove UNREAD label)
- URLs in email body are clickable and open in new tab

---

### 6.3 Gmail — Compose & Send

**Goal:** Write and send an email with minimal friction.

**Behavior:**
- Triggered by `c` key or "Compose" button
- Opens as a floating panel (bottom-right, Superhuman-style) or full-screen modal (togglable)
- Fields: To (multi-value with autocomplete from sent history), Cc, Bcc (toggled by button), Subject, Body
- Body is a rich text editor (bold, italic, bullet list, code block — minimum viable set)
- "Send" button (or `Cmd+Enter`) sends immediately
- "Save Draft" button (or auto-save on close) saves as draft
- Drafts list accessible from sidebar

**Technical implementation:**
- Send calls `POST /api/gmail/messages/send`
- API route builds RFC 2822 MIME message, base64url-encodes it, passes `raw` to `gmail.api.messages.send`
- To/Cc/Bcc parsed as comma-separated values, validated as emails before send
- Reply pre-populates `In-Reply-To` and `References` headers and threads correctly

**Acceptance criteria:**
- Sent email appears in Sent folder after sync
- Draft saved locally appears in Drafts without requiring sync
- Validation: cannot send without at least one To address and a subject
- `Cmd+Enter` sends; `Escape` closes composer with draft save prompt

---

### 6.4 Gmail — Webhooks (Real-time Inbox)

**Goal:** New emails arrive in the inbox without the user having to click Sync.

**Behavior:**
- Corsair webhook handler at `POST /api/webhooks` receives Gmail push notifications via Google Cloud Pub/Sub (already configured via `CORSAIR_GMAIL_TOPIC_ID`)
- On new message webhook: Corsair updates its DB cache, then the handler triggers AI prioritization for the new message
- The frontend polls for updates every 30 seconds as a fallback (TanStack Query `refetchInterval`) — webhooks are primary

**Acceptance criteria:**
- New email received → appears in inbox within 5 seconds without manual refresh
- Webhook handler returns 200 for all handled events, 404 for unmatched
- Handler is tenant-aware (routes to correct user's inbox)

---

### 6.5 Google Calendar — Week View

**Goal:** See your week at a glance and navigate through time.

**Behavior:**
- Default view: current week, Monday–Sunday, 7am–8pm visible, scroll to see rest of day
- Time grid: hours on left axis, days as columns
- Events rendered as colored blocks, positioned by start/end time
- Overlapping events shown side-by-side within a column
- ← / → buttons (or `[` / `]` keys) navigate to previous/next week
- "Today" button jumps to current week and highlights today's column
- Clicking an event opens event detail panel

**Technical implementation:**
- Week load reads from `googlecalendar.db.events.list` with `timeMin`/`timeMax` for the displayed week
- "Sync" triggers `googlecalendar.api.events.getMany` for the current week range
- Dates formatted with `date-fns` (already installed)

**Acceptance criteria:**
- All-day events shown in a banner row at top of the week
- Events < 30 min show title only; events ≥ 30 min show title + time
- Color-coded by calendar (primary = blue accent, others cycle through a defined palette)

---

### 6.6 Google Calendar — Create Event & Send Invite

**Goal:** Create a calendar event and send invites in as few steps as possible.

**Behavior:**
- Triggered by `n` key (in calendar view) or "New Event" button
- Modal form: Title, Date, Start time, End time, Attendees (multi-value email input), Description, Location (optional)
- "Create & Send Invite" button creates the event and emails all attendees
- "Create Only" button creates without sending notifications

**Technical implementation:**
- Calls `POST /api/calendar/events`
- API route calls `googlecalendar.api.events.create` with `sendUpdates: 'all'` (invite) or `'none'` (no notify)
- `start` and `end` formatted as RFC 3339 datetime strings

**Acceptance criteria:**
- Created event appears in week view immediately (optimistic update + sync)
- Attendees receive Google Calendar invite emails
- Validation: title and at least one time range required before submit

---

### 6.7 Advanced Search

**Goal:** Surface Gmail's powerful search in a better UI than Gmail provides.

**Behavior:**
- Global search bar (activated by `/` key) searches across email + calendar
- Email search uses `gmail.db.messages.search` with a `data.snippet.contains` filter for free-text, plus structured filters
- Structured filter chips: From, To, Subject, Has Attachment, Date range, Priority (custom field)
- Results update as-you-type (debounced 300ms)
- Calendar search searches event titles and descriptions

**Acceptance criteria:**
- Results from DB cache only (no live API call on each keystroke)
- Clearing search returns to inbox view
- Search history persisted in localStorage (last 10 queries)

---

## 7. Technical Stack

All packages listed below are already installed in the project.

| Concern | Technology | Notes |
|---|---|---|
| Framework | Next.js 15 App Router | Server Components default; Client Components where interactive |
| Database | PostgreSQL + Drizzle ORM | `server/db/` |
| Auth | Better Auth | email/password + GitHub + Google OAuth |
| Integration layer | Corsair (`corsair` + `@corsair-dev/gmail` + `@corsair-dev/googlecalendar`) | All external API calls go through Corsair |
| Client data | TanStack Query | Fetches from internal API routes |
| UI components | shadcn/ui + Tailwind CSS | Dark theme default |
| Icons | Phosphor Icons (`@phosphor-icons/react`) | Already installed |
| AI (agent) | `@openai/agents` via OpenRouter | For agent chat |
| AI (prioritization) | OpenRouter HTTP API | Cheap model, direct fetch |
| MCP | `@corsair-dev/mcp` | Exposes Corsair tools to agent |
| Dates | `date-fns` | Already installed |

**No new packages required for Phase 1.**

---

## 8. Architecture & Data Flow

### Read (inbox / calendar list)
```
Browser → GET /api/gmail/messages
         → server/services/gmail.ts → corsair.withTenant(userId).gmail.db.messages.list()
         → Corsair reads from corsair_entities table
         → Returns deduplicated, sorted array
```

### Write (send email / create event)
```
Browser → POST /api/gmail/messages/send
         → server/services/gmail.ts → buildRawMessage() → corsair.withTenant(userId).gmail.api.messages.send()
         → Live call to Gmail API via Corsair
```

### Webhook (real-time updates)
```
Google Pub/Sub → POST /api/webhooks
               → processWebhook(corsair, headers, body, { tenantId })
               → Corsair updates corsair_entities cache
               → Handler triggers POST /api/ai/prioritize for new messages
               → Frontend refetches via TanStack Query invalidation (or polling fallback)
```

### Agent chat
```
Browser (chat message) → POST /api/agent/chat (SSE stream)
                        → OpenAI Agent with Corsair MCP tools attached
                        → Agent calls Corsair MCP → Corsair executes Gmail / Calendar actions
                        → Streamed text response back to browser
```

### Tenant resolution
Every API route calls `getTenant(session.user.id)` which returns `corsair.withTenant(userId)`. The user's Better Auth `user.id` is the Corsair tenant ID (enforced by `corsair_accounts.tenant_id → user.id` FK in the schema).

---

## 9. Data Models

### Existing (do not modify migrations)

**`corsair_entities`** — Corsair's cache of Gmail messages and Calendar events
```
id          text (PK)
account_id  text → corsair_accounts.id
entity_id   text  (Gmail message ID / Calendar event ID)
entity_type text  (e.g. "gmail.message", "googlecalendar.event")
version     text
data        jsonb  (parsed fields: subject, from, to, snippet, body, start, end, etc.)
created_at  timestamptz
updated_at  timestamptz
```

**`corsair_accounts`** — one row per user per connected integration
```
tenant_id       text → user.id
integration_id  text → corsair_integrations.id
config          jsonb
```

---

### New schemas to add (`server/db/schema/`)

**`email_priorities`**
```typescript
{
  id:                text (PK, cuid)
  user_id:           text → user.id (cascade delete)
  message_entity_id: text  (corsair_entities.entity_id)
  priority:          text  ('high' | 'medium' | 'low')
  reasoning:         text  (1-sentence LLM explanation)
  created_at:        timestamp
}
```
Index on `(user_id, message_entity_id)`.

**`user_preferences`**
```typescript
{
  user_id:           text (PK) → user.id (cascade delete)
  ui_config:         jsonb  (default: {})  // panel layout prefs, theme overrides
  updated_at:        timestamp
}
```

**`agent_conversations`**
```typescript
{
  id:         text (PK, cuid)
  user_id:    text → user.id (cascade delete)
  messages:   jsonb  // array of { role, content, timestamp }
  created_at: timestamp
  updated_at: timestamp
}
```

---

## 10. API Route Design

All routes are in `app/api/`. All routes require an authenticated session; return 401 if no session.

### Gmail

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/gmail/messages` | List inbox from DB cache. Query params: `limit` (default 50), `offset`, `view` (inbox/sent/drafts) |
| `GET` | `/api/gmail/messages/[id]` | Get single message. Cache-first; falls back to live API |
| `GET` | `/api/gmail/messages/search` | Search DB cache. Query params: `q` (freetext), `from`, `subject`, `priority`, `dateAfter`, `dateBefore` |
| `POST` | `/api/gmail/messages/send` | Send email. Body: `{ to, cc?, bcc?, subject, body, replyToMessageId? }` |
| `POST` | `/api/gmail/drafts` | Create draft. Body: `{ to?, subject?, body? }` |
| `POST` | `/api/gmail/drafts/[id]/send` | Send saved draft |
| `POST` | `/api/gmail/sync` | Trigger live sync from Gmail API. Pulls latest 50 threads |
| `PATCH` | `/api/gmail/messages/[id]/read` | Mark message read/unread. Body: `{ read: boolean }` |

### Calendar

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/calendar/events` | List events for week. Query params: `weekStart` (ISO date) |
| `GET` | `/api/calendar/events/search` | Search events. Query params: `q` |
| `POST` | `/api/calendar/events` | Create event. Body: `{ title, start, end, attendees?, description?, sendInvite }` |
| `POST` | `/api/calendar/sync` | Trigger live sync from Calendar API for current week |

### Webhooks & AI

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/webhooks` | Corsair webhook handler. Called by Google Pub/Sub |
| `POST` | `/api/ai/prioritize` | Classify email priority. Body: `{ messageEntityId, subject, snippet, from }` |

### Agent

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/agent/chat` | Agent chat with SSE streaming. Body: `{ message, conversationId? }` |

---

## 11. UI / UX Design

### Design Language

**Feeling:** The app should feel like a terminal that got a luxury makeover — fast, precise, no wasted motion. Every element earns its place. Density is a feature.

**Color palette:**
- Background: near-black (`#0a0a0a`)
- Surface: dark gray (`#111111`, `#1a1a1a` for cards/panels)
- Border: `#2a2a2a` (subtle, low contrast)
- Text primary: `#f0f0f0`
- Text secondary: `#888888`
- Accent: a single vivid blue (`#3b82f6`) used sparingly — unread indicators, active state, buttons
- Priority badges: High = amber (`#f59e0b`), Medium = no badge, Low = muted gray
- Success / send confirmation: `#22c55e` (brief flash, then gone)

**Typography:**
- Interface text: Nunito Sans (already configured) — clean, readable at small sizes
- Email body: system-font stack, slightly larger, generous line height
- Monospace elements (code in emails): Geist Mono (already configured)

**Motion:** Minimal. Panel transitions slide in 150ms. Loading states use a single-line shimmer. No bounce, no spring physics. Fast computers should feel fast.

---

### Layout

The app has a persistent three-column shell after login:

```
┌──────────────────────────────────────────────────────────────────┐
│  [Nav Rail]  │  [List Panel]           │  [Detail Panel]         │
│  64px wide   │  320px, scrollable      │  flex-1, fills rest     │
│              │                         │                         │
│  ● Mail      │  thread 1               │  (email body / event /  │
│  ○ Calendar  │  thread 2               │   compose / agent chat) │
│  ○ Agent     │  thread 3               │                         │
│              │  ...                    │                         │
│  ──          │                         │                         │
│  [Settings]  │  [Search bar at top]    │                         │
└──────────────────────────────────────────────────────────────────┘
```

**Nav Rail (left, 64px):** Icon-only navigation between Mail, Calendar, Agent Chat, and Settings. Active section highlighted with accent. Tooltip on hover shows label. No text labels by default — saves horizontal space.

**List Panel (center, 320px fixed):** Thread list for mail, event list for calendar, conversation history for agent. Sticky search bar at top. Scrollable. Selected item highlighted. Can be collapsed (toggled by `\` key) for focused reading.

**Detail Panel (right, flex-1):** Shows the selected email thread, calendar event, compose window, or agent chat. When nothing is selected, shows an empty state prompt ("Press `c` to compose, `/` to search").

---

### Mail View Details

**Thread list row:**
```
[Unread dot]  [Avatar initials]  [Sender name, 14px bold if unread]   [Timestamp, right-aligned]
              [Subject, 13px]                                          [Priority badge if high]
              [Snippet, 12px muted, truncated to 1 line]
```

Row height: 68px. Hover: subtle background lift. Active: accent left border (3px).

**Thread detail:**
- Full-width header: sender name + email, to/cc fields (collapsible), timestamp
- Collapsed messages show one-liner: "John Doe — Re: Q3 roadmap — Jun 12, 2:31 PM"
- Latest message expanded by default
- Reply toolbar fixed at bottom of thread: Reply, Reply All, Forward, Archive, Delete

**Compose window:**
Slides up from bottom right as a panel (400px wide, 480px tall). Can be expanded to full-screen (toggle with `⌘ Shift F`). Title bar shows "New Message" or "Reply to [name]". Minimise button collapses it back to a tab at the bottom.

---

### Calendar View Details

**Week grid:**
- 7 columns (Mon–Sun), hour rows (24h but scrolled to 7am by default)
- Column headers show: "Mon 16" with today's date circled in accent
- Event blocks: colored with 4px rounded corners, show event title + time in white text
- All-day events: horizontal bar spanning full column width, above the time grid
- Drag-to-create (future): click and drag on empty time slot creates new event at that duration

**Event detail popover:**
- Appears on event click, anchored to the block
- Shows: title, time, attendees (avatars + names), description, "Edit" + "Delete" actions

**Create Event modal:**
- Minimal fields above the fold: Title, Date + Time (paired input), Attendees
- Expandable section for Description + Location
- Toggle: "Notify attendees" (on by default)

---

### Agent Chat View Details

- Full-panel chat interface: message history scrolls, input fixed at bottom
- User messages right-aligned, agent messages left-aligned
- Agent messages support markdown rendering (bold, lists, code blocks)
- When agent performs an action (sends email, creates event), a card renders inline in the message confirming the action with a summary
- "New conversation" button starts a fresh session (archives old one)
- Conversation history persisted in `agent_conversations`

---

## 12. Corsair Connection Flow

Users authenticate into the app via Better Auth (Google, GitHub, or email/password). This is separate from authorizing Corsair to access their Gmail and Calendar.

After first login, a "Connect Your Accounts" screen is shown before the main app. This is where users grant Corsair OAuth access to Gmail and Calendar.

### Flow

1. User signs in with Better Auth → redirected to `/connect`
2. `/connect` page checks `corsair_accounts` for rows where `tenant_id = user.id`
3. If no Gmail account connected: shows "Connect Gmail" button
4. If no Calendar account connected: shows "Connect Google Calendar" button
5. Each button triggers `GET /api/corsair/auth?plugin=gmail` (or `googlecalendar`)
6. API route calls Corsair's auth URL generator → redirects user to Google OAuth
7. After OAuth callback, Corsair stores encrypted tokens in `corsair_accounts`
8. User redirected back to `/connect`, which now shows both integrations as "Connected ✓"
9. "Continue to app" button → redirects to `/mail`

### Reconnect
In Settings, users can disconnect and reconnect each integration. Disconnecting deletes the `corsair_accounts` row and clears associated `corsair_entities` rows for that tenant.

### Middleware
A Next.js middleware checks on every request to `/mail`, `/calendar`, `/agent` that at least one Corsair account is connected. If not, redirect to `/connect`.

---

## 13. AI Email Prioritization

### Purpose
Every new email is classified as High, Medium, or Low priority using a cheap LLM call (not a heavyweight model). This classification is shown as a badge in the inbox and can be used to filter and sort.

### Trigger
Webhook receives a new Gmail message → `POST /api/webhooks` handler calls `POST /api/ai/prioritize` with the message metadata.

### LLM call
**Model:** `google/gemini-flash-1.5-8b` via OpenRouter (set in env as `OPENROUTER_CLASSIFIER_MODEL`). This model is extremely cheap (< $0.001 per email).

**Prompt:**
```
Classify the priority of this email as exactly one of: high, medium, or low.

From: {from}
Subject: {subject}
Snippet: {snippet}

Rules:
- high: requires action from the recipient soon, is from someone important, or is time-sensitive
- low: newsletters, automated notifications, marketing, mailing lists
- medium: everything else

Respond with JSON: { "priority": "high"|"medium"|"low", "reasoning": "one sentence" }
```

**Response handling:**
- Parse JSON response, store in `email_priorities` table
- If LLM call fails or returns invalid JSON: default to `medium`, no reasoning

### Display
- High priority: amber badge "⚡ High" in thread list row
- Low priority: muted gray badge "Low" (only visible on hover or in detail)
- Medium: no badge (default, no visual noise)
- Users can manually override in the detail view (overrides DB record)

---

## 14. Agent Chat

### Purpose
A natural language interface that can execute email and calendar actions via Corsair's MCP server. Users can do in one sentence what otherwise takes 10+ clicks.

### Example interactions
- "Send a calendar invite to alex@company.com for next Thursday at 2 PM. Subject: 'Q3 sync'. Also email him saying I look forward to it."
- "Find all unread emails from Sarah and summarize them."
- "Move all newsletter emails to archive."
- "What does my Friday look like?"

### Architecture

```
User message
    ↓
POST /api/agent/chat  (streams SSE)
    ↓
OpenAI Agent (via @openai/agents, using OpenRouter)
    ↓
Corsair MCP Server (@corsair-dev/mcp)
    ↓
Corsair executes: gmail.api.messages.send / googlecalendar.api.events.create / etc.
    ↓
Agent receives tool result, generates natural language confirmation
    ↓
SSE stream back to browser
```

### OpenAI Agent configuration
- Model: `openai/gpt-4o` via OpenRouter (set as `OPENROUTER_AGENT_MODEL`)
- MCP server: initialize `@corsair-dev/mcp` with `corsair.withTenant(userId)` — this exposes all Corsair tools to the agent scoped to the authenticated user
- System prompt: tells the agent it is an email + calendar assistant with access to the user's Gmail and Google Calendar
- Tool calls are visible in the chat as expandable "action cards" (e.g. "📧 Sent email to alex@company.com")

### Conversation persistence
- Each conversation has an ID stored in `agent_conversations.id`
- Messages array (role + content + timestamp) stored in `messages` jsonb column
- Frontend passes `conversationId` on subsequent messages to maintain context
- New conversation button generates a new ID and starts fresh

---

## 15. Keyboard Shortcuts

All shortcuts work when focus is in the main panel (not an input field). Shortcuts are displayed in a cheat sheet accessed via `?`.

### Global

| Key | Action |
|---|---|
| `?` | Toggle keyboard shortcut cheat sheet |
| `g m` | Go to Mail |
| `g c` | Go to Calendar |
| `g a` | Go to Agent |
| `/` | Focus search bar |
| `Escape` | Close modal / deselect / exit search |

### Mail — List

| Key | Action |
|---|---|
| `j` | Select next thread |
| `k` | Select previous thread |
| `Enter` or `o` | Open selected thread |
| `c` | Compose new email |
| `e` | Archive selected thread |
| `#` | Delete selected thread |
| `u` | Mark selected as unread |
| `r` | Reply (opens thread + reply composer) |

### Mail — Thread Detail

| Key | Action |
|---|---|
| `r` | Reply to latest message |
| `a` | Reply all |
| `f` | Forward |
| `e` | Archive thread |
| `[` | Go to previous thread |
| `]` | Go to next thread |

### Compose

| Key | Action |
|---|---|
| `Cmd/Ctrl + Enter` | Send |
| `Cmd/Ctrl + Shift + D` | Save as draft |
| `Escape` | Close (with draft save prompt) |
| `Cmd/Ctrl + Shift + F` | Toggle full-screen compose |

### Calendar

| Key | Action |
|---|---|
| `n` | New event |
| `[` | Previous week |
| `]` | Next week |
| `t` | Jump to today |

---

## 16. Development Phases

### Phase 1 — Foundation (Est. 3–4 days)
- Corsair connection flow at `/connect`
- Tenant helper (`server/lib/tenant.ts`)
- Middleware guard for connected integrations
- Webhook handler at `/api/webhooks`
- App shell layout (nav rail + panel structure)
- New Drizzle schema files (do not touch existing migrations)

**Exit criteria:** User can sign in, connect Gmail + Calendar, and the webhook endpoint receives events.

### Phase 2 — Email Core (Est. 4–5 days)
- Inbox list API route + service + query
- Thread detail API route (cache-first)
- Compose window component
- Send email API route + RFC 2822 encoder utility
- Draft create + send
- Manual sync API route
- Mark read/unread

**Exit criteria:** User can read inbox, read full threads, compose and send email, create and send drafts.

### Phase 3 — Calendar Core (Est. 3–4 days)
- Week view component (time grid, event blocks)
- Calendar events API route + service
- Event detail popover
- Create event modal + send invite API route
- Manual sync API route

**Exit criteria:** User can view their week, see events, create events, and send invites.

### Phase 4 — Real-time & AI (Est. 2–3 days)
- Webhook handler integration (Gmail Pub/Sub fully wired)
- AI prioritization: API route, LLM call, DB storage
- Priority badges in inbox list
- TanStack Query polling as fallback (30s interval)

**Exit criteria:** New emails appear in inbox within 5 seconds. All emails in inbox have priority badges.

### Phase 5 — Search & Shortcuts (Est. 2–3 days)
- Global search bar component
- Gmail search API route using Corsair DB search
- Structured filter chips (from, subject, date, priority)
- Calendar event search
- Full keyboard shortcut implementation
- Shortcut cheat sheet modal (`?` key)

**Exit criteria:** Search returns relevant results from cache. All shortcuts in spec work correctly.

### Phase 6 — Agent Chat (Est. 3–4 days)
- Agent chat UI (full panel, SSE streaming)
- `/api/agent/chat` SSE route
- OpenAI Agent + Corsair MCP integration
- Conversation persistence (DB + frontend state)
- Action confirmation cards in chat

**Exit criteria:** User can send natural language commands that result in real email sends and calendar event creation.

### Phase 7 — Polish (Est. 2 days)
- Responsive list/detail split on smaller screens
- Error states and empty states for all views
- Loading skeletons
- Toast notifications (Sonner, already installed) for send confirmations, errors
- Keyboard shortcut cheat sheet polish

---

## 17. Future Integrations

The architecture is designed so that adding a new Corsair integration requires:
1. Adding the `@corsair-dev/<integration>` package
2. Adding the plugin to `server/corsair.ts`
3. Adding the integration to the `/connect` flow
4. Building a new UI module under `app/`
5. Adding API routes in `app/api/<integration>/`

Candidate integrations (in rough priority order):
1. **Slack** — unified inbox + send messages from app
2. **Linear** — view/create/update issues; agent can create tickets from email context
3. **GitHub** — PR notifications, review requests surfaced in unified feed
4. **Notion** — create pages from email; agent can save email summaries to Notion
5. **HubSpot / Salesforce** — CRM context alongside email threads from those contacts

**Universal features unlocked by multiple integrations:**
- Unified activity feed: everything important from all connected tools, ranked by AI
- Cross-integration agent actions: "Create a Linear ticket and reply to the email thread with the ticket link"
- Integration management dashboard: connect, disconnect, view sync status, view recent webhook events

---

## 18. Technical Challenges & Mitigations

| Challenge | Mitigation |
|---|---|
| Gmail `messages.send` requires base64url-encoded RFC 2822 | `server/lib/email-encoding.ts` — utility that builds MIME string (with `\r\n` line endings), then encodes (replace `+`→`-`, `/`→`_`, strip `=`) |
| DB cache may have duplicate rows for same `entity_id` | Deduplicate in service layer: group by `entity_id`, keep row with latest `updated_at` |
| `googlecalendar.api.events.getMany` without `timeMin` returns events from epoch | Always pass `timeMin` and `timeMax` covering exactly the displayed week |
| Corsair OAuth in multi-user production (can't use CLI per user) | Corsair exposes auth URL endpoints callable at runtime; app redirects user through them. Document this in the connection flow. |
| LLM prioritization failure for a message | Default to `medium` silently. Never block inbox display on AI result. |
| Agent hallucinating API calls | Corsair MCP exposes strictly typed tool definitions — the agent can only call real, valid endpoints |
| Webhook routing to correct tenant | `processWebhook()` handles tenant resolution internally from the webhook payload |
| Long email threads with many messages | Collapse all but the latest message by default; lazy-load older messages on expand |
| RFC 2822 threading for replies (In-Reply-To, References headers) | Fetch the original message's headers, pass them through in the compose utility |

---

## 19. Environment Variables

### Already configured

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/workspace_ai
CORSAIR_KEK=<base64 encryption key>
CORSAIR_GOOGLE_CLIENT_ID=<google client id for corsair>
CORSAIR_GOOGLE_CLIENT_SECRET=<secret>
CORSAIR_WEBHOOK_URL=https://<ngrok-or-prod-domain>
CORSAIR_GMAIL_TOPIC_ID=projects/<gcp-project>/topics/<topic-name>
OPENROUTER_API_KEY=<key>
BETTER_AUTH_SECRET=<secret>
BETTER_AUTH_URL=https://<domain>
NEXT_PUBLIC_APP_URL=https://<domain>
GOOGLE_CLIENT_ID=<google client id for better auth>
GOOGLE_CLIENT_SECRET=<secret>
GITHUB_CLIENT_ID=<github oauth app id>
GITHUB_CLIENT_SECRET=<secret>
```

### To add

```env
# Model used for agent chat (gpt-4o class)
OPENROUTER_AGENT_MODEL=openai/gpt-4o

# Model used for email prioritization (cheap, fast)
OPENROUTER_CLASSIFIER_MODEL=google/gemini-flash-1.5-8b

# Tenant ID for local dev (matches a real user.id in your DB)
TENANT_ID=<your user.id from better auth>
```

---

*End of PRD v1.0*

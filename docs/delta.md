# Delta — Corsair Hub Build Tracker

Tracks every step from `planv1.md` against actual repo state.
**Legend:** ✅ Done · 🔄 In Progress · ⬜ Not Started · ❌ Blocked

---

## Pre-work

| Step | Task | Status | Notes |
|------|------|--------|-------|
| 0 | `corsair list` — discover all endpoints | ⬜ | Must run before Phase 2 service layer |
| 0b | Verify schema directory + drizzle.config.ts | ✅ | `server/db/schema/` has `auth-schema.ts`, `corsair-schema.ts`, `index.ts` |

---

## Phase 1 — Foundation ✅

| Step | File(s) | Status | Notes |
|------|---------|--------|-------|
| 1a | `server/db/schema/email-priorities.ts` | ✅ | |
| 1b | `server/db/schema/user-preferences.ts` | ✅ | |
| 1c | `server/db/schema/agent-conversations.ts` | ✅ | |
| 1d | Export new schemas from `server/db/schema/index.ts` | ✅ | |
| 1e | `npm run db:generate` + `npm run db:migrate` | ✅ | Migration `0002_illegal_zzzax.sql` applied |
| 2 | `server/lib/tenant.ts` | ✅ | |
| 3 | `server/lib/email-encoding.ts` | ✅ | `buildRawMessage` + `parseEmailAddress` |
| 4a | `app/(app)/layout.tsx` — three-panel shell + auth guard | ✅ | Also creates `components/app-nav.tsx` |
| 4b | `app/(app)/mail/page.tsx` | ✅ | Placeholder |
| 4c | `app/(app)/calendar/page.tsx` | ✅ | Placeholder |
| 4d | `app/(app)/agent/page.tsx` | ✅ | Placeholder |
| 5a | `app/connect/page.tsx` | ✅ | Uses `corsair.manage.connectionStatus.get()` |
| 5b | `app/api/corsair/auth/route.ts` | ✅ | Uses `generateOAuthUrl` from `corsair/oauth` |
| 5c | `app/api/corsair/callback/route.ts` | ✅ | Uses `processOAuthCallback` from `corsair/oauth` |
| 6 | `middleware.ts` | ✅ | Protects `/mail`, `/calendar`, `/agent`, `/settings` |
| 7 | `app/api/webhooks/route.ts` | ✅ | Fixed: `processWebhook` returns `WebhookFilterResult`, not bare `Response` |

**Deviations from plan:**
- `redirect()` from `next/navigation` does not work in Route Handlers → use `NextResponse.redirect()`
- `processWebhook` returns `WebhookFilterResult` (has `.plugin`, `.response`, `.responseHeaders`), not a bare `Response` — plan's `result.response` was wrong
- `corsair.manage.connectionStatus.get({ tenantId })` used on connect page instead of raw DB query

**Phase 1 gate:** Sign in → `/connect` → connect Gmail → connect Calendar → land on `/mail` — **Ready to test**

---

## Phase 2 — Email Core

| Step | File(s) | Status | Notes |
|------|---------|--------|-------|
| 8 | `server/db/queries/gmail.ts` | ⬜ | `server/db/queries/` dir does not exist |
| 9 | `server/services/gmail.ts` | ⬜ | `server/services/` dir does not exist |
| 10a | `app/api/gmail/messages/route.ts` | ⬜ | |
| 10b | `app/api/gmail/messages/[id]/route.ts` | ⬜ | |
| 10c | `app/api/gmail/messages/search/route.ts` | ⬜ | |
| 10d | `app/api/gmail/messages/send/route.ts` | ⬜ | |
| 10e | `app/api/gmail/messages/[id]/read/route.ts` | ⬜ | |
| 10f | `app/api/gmail/drafts/route.ts` | ⬜ | |
| 10g | `app/api/gmail/drafts/[id]/send/route.ts` | ⬜ | |
| 10h | `app/api/gmail/sync/route.ts` | ⬜ | |
| 11 | `components/mail/thread-list.tsx` | ⬜ | |
| 11b | `components/mail/thread-row.tsx` | ⬜ | |
| 12 | `components/mail/thread-detail.tsx` | ⬜ | |
| 13 | `components/mail/compose-window.tsx` | ⬜ | |

**Phase 2 gate:** Inbox loads < 200ms → open thread → compose → `Cmd+Enter` → sent

---

## Phase 3 — Calendar Core

| Step | File(s) | Status | Notes |
|------|---------|--------|-------|
| 14a | `server/db/queries/calendar.ts` | ⬜ | |
| 14b | `server/services/calendar.ts` | ⬜ | |
| 15a | `app/api/calendar/events/route.ts` | ⬜ | |
| 15b | `app/api/calendar/events/search/route.ts` | ⬜ | |
| 15c | `app/api/calendar/sync/route.ts` | ⬜ | |
| 16a | `components/calendar/week-view.tsx` | ⬜ | |
| 16b | `components/calendar/event-block.tsx` | ⬜ | |
| 16c | `components/calendar/event-detail-popover.tsx` | ⬜ | |
| 17 | `components/calendar/create-event-modal.tsx` | ⬜ | |

**Phase 3 gate:** Week view → event detail → create event → attendee receives invite

---

## Phase 4 — Real-time & AI

| Step | File(s) | Status | Notes |
|------|---------|--------|-------|
| 18 | Update `app/api/webhooks/route.ts` — wire to prioritization | ⬜ | Depends on Step 7 |
| 19a | `server/services/ai.ts` | ⬜ | |
| 19b | `app/api/ai/prioritize/route.ts` | ⬜ | |
| 20 | Backfill inbox prioritization on first load | ⬜ | |
| 21 | Update `thread-row.tsx` with priority badges | ⬜ | Depends on Step 11b |

**Phase 4 gate:** Send self email → appears < 5s → priority badge shows

---

## Phase 5 — Search & Keyboard Shortcuts

| Step | File(s) | Status | Notes |
|------|---------|--------|-------|
| 22a | Update `app/api/gmail/messages/search/route.ts` with filters | ⬜ | |
| 22b | Update `app/api/calendar/events/search/route.ts` | ⬜ | |
| 23 | `components/search/search-bar.tsx` | ⬜ | |
| 24 | `hooks/use-keyboard-shortcuts.ts` | ⬜ | |
| 25 | `components/shortcuts-modal.tsx` | ⬜ | |

**Phase 5 gate:** `/` → search → filter by sender. All shortcuts fire. `?` shows cheat sheet.

---

## Phase 6 — Agent Chat

| Step | File(s) | Status | Notes |
|------|---------|--------|-------|
| 26 | Investigate `@corsair-dev/mcp` exports | ⬜ | Must do before writing agent code |
| 27a | `server/db/queries/agent-conversations.ts` | ⬜ | |
| 27b | `server/services/agent.ts` | ⬜ | |
| 28 | `app/api/agent/chat/route.ts` (SSE) | ⬜ | |
| 29 | `components/agent/chat-panel.tsx` | ⬜ | |

**Phase 6 gate:** "Send email to X saying Y" → email actually delivered

---

## Phase 7 — Polish

| Step | File(s) | Status | Notes |
|------|---------|--------|-------|
| 30 | Loading skeletons (thread list, detail, calendar, agent) | ⬜ | |
| 31 | Empty states (inbox, search, calendar, agent) | ⬜ | |
| 32 | Toast notifications via Sonner | ⬜ | Sonner already installed |
| 33 | `app/(app)/settings/page.tsx` | ⬜ | |

**Phase 7 gate:** All error/empty/toast states render correctly

---

## Existing Repo Inventory

### What's already there
- `server/corsair.ts` — Corsair configured with gmail + googlecalendar plugins, multiTenancy: true
- `lib/betterauth/auth.ts`, `auth-client.ts`, `session.ts` — Better Auth fully set up
- `server/db/schema/auth-schema.ts` — users, sessions, accounts, etc.
- `server/db/schema/corsair-schema.ts` — corsair_accounts (tenantId → user.id)
- `server/db/schema/index.ts` — exports auth + corsair schemas
- `server/db/index.ts` — DB client
- `app/(auth)/login/page.tsx`, `signup/page.tsx` — auth pages
- `app/api/auth/[...all]/route.ts` — Better Auth handler
- `app/dashboard/page.tsx` — placeholder dashboard
- `components/ui/*` — full shadcn component library
- `components/providers/query-provider.tsx` — TanStack Query wired
- `components/providers/theme-provider.tsx` — theme ready
- Sonner installed (in `components/ui/sonner.tsx`)

### What does NOT exist yet (post Phase 1)
- `server/services/` — directories created, no files yet
- `server/db/queries/` — directories created, no files yet
- `app/api/gmail/` — does not exist
- `app/api/calendar/` — does not exist
- `app/api/ai/` — does not exist
- `app/api/agent/` — does not exist
- `components/mail/` — does not exist
- `components/calendar/` — does not exist
- `components/agent/` — does not exist
- `components/search/` — does not exist
- `hooks/use-keyboard-shortcuts.ts` — does not exist

---

## Change Log

| Date | Step | Action | Result |
|------|------|--------|--------|
| 2026-06-19 | — | Created delta.md, audited repo state | Baseline established |
| 2026-06-19 | Phase 1 | All 16 steps completed | Build passes clean (`npm run build` green) |
| 2026-06-19 | Phase 1 | Discovered `corsair/oauth` module for `generateOAuthUrl`/`processOAuthCallback` | Documented API deviation |
| 2026-06-19 | Phase 1 | Discovered `WebhookFilterResult` return type from `processWebhook` | Plan had wrong type; fixed |

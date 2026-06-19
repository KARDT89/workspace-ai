# WSAI — Complete UI Design Plan

## First Step: Export to docs/design.md

The entire content of this plan will be written to `docs/design.md` as a versioned design document committed to the repo. This file is the single source of truth for all UI decisions during implementation.

---

## Context

The existing UI is functional but bare-bones: a 64px icon nav rail, a basic thread list, a minimal thread detail pane, and a plain textarea-based compose window. The goal is a complete UI overhaul to make Corsair Hub feel like a premium, Dribbble-quality product — think Linear meets Superhuman: keyboard-first, animation-rich, visually distinctive, and fully responsive on mobile. Every screen gets a ground-up redesign. No structural logic changes, only UI/UX layers.

---

## Design Philosophy

**"A terminal that got a luxury makeover."** — PRD

- Dark mode primary (`#0a0a0a` ground, `#3b82f6` accent, `#f0f0f0` text)
- Density is a feature: pack information without clutter
- Every interaction has motion feedback — but motion is fast (100–200ms), never decorative
- Mobile-first responsive: full bottom-tab + drawer-based mobile UX
- Aesthetic risk: **VS Code-style status bar** at the bottom of the shell — context, AI activity, keyboard hints

---

## Design Token Additions (globals.css)

Add to `.dark {}` block:

```css
/* Semantic */
--primary-glow: oklch(0.623 0.214 259.5 / 0.15);   /* blue glow for selected/active */
--amber: oklch(0.77 0.157 70.5);                     /* high priority */
--amber-bg: oklch(0.77 0.157 70.5 / 0.15);
--success: oklch(0.725 0.178 147.2);                 /* sent / connected */
--success-bg: oklch(0.725 0.178 147.2 / 0.12);

/* Thread list */
--thread-hover: oklch(0.16 0 0);
--thread-selected: oklch(0.18 0 0);

/* Status bar */
--status-bar: oklch(0.11 0 0);
```

---

## Libraries to Install

```bash
pnpm add framer-motion
pnpm add @tiptap/react @tiptap/pm @tiptap/starter-kit
pnpm add @tiptap/extension-link @tiptap/extension-placeholder @tiptap/extension-underline
pnpm add @tanstack/react-virtual
pnpm add react-markdown remark-gfm rehype-highlight
```

**Copy-paste from their CLIs (no npm package needed):**
- `pnpm dlx magicui-cli add blur-fade border-beam shimmer-button` — Magic UI animations
- `npx aceternity-ui add aurora-background moving-border spotlight` — Aceternity effects
- Copy React Bits "Shiny Text" and "Animated Text" from reactbits.dev

**Already installed (use these):** `vaul`, `sonner`, `cmdk` (via `command.tsx`), `embla-carousel`, `react-resizable-panels`, `tw-animate-css`, `@phosphor-icons/react`

---

## Screen Plans

---

### 1. Auth Pages — Login & Signup

**File:** `app/(auth)/login/page.tsx`, `app/(auth)/signup/page.tsx`

**Layout:** Full-screen split — left 55% is aurora background (Aceternity `AuroraBackground`) with animated blue/indigo/violet gradients, right 45% is the form panel.

**Aurora side:** 
- Animated blobs behind Corsair Hub logo + tagline: *"Email built exactly the way you'd build it."*
- Subtle floating particle grid (Magic UI `Particles` or CSS-only dot matrix)
- On mobile: aurora collapses, becomes top hero banner above the form

**Form panel (right):**
- Dark glass card (`bg-card/80 backdrop-blur-xl border border-border`)
- Logo at top (icon + wordmark)
- Google OAuth button (prominent, styled with shimmer effect)
- GitHub OAuth button
- "Or continue with email" separator
- Email + password fields with animated label-float effect (label moves up on focus)
- Forgot password link below password
- Submit button: Magic UI `ShimmerButton` with loading spinner inside
- Sign up link at bottom
- Terms disclaimer

**Transition:** On successful auth → `framer-motion` AnimatePresence with `y: -20, opacity: 0` exit + route push.

---

### 2. Connect / Onboarding

**File:** `app/connect/page.tsx`

**Layout:** Centered, full-screen dark background with subtle radial gradient from center.

**Step flow (2 steps):**
- Step 1: Connect integrations
- Step 2: Continue to app (enabled when all connected)

**Progress indicator:** Two dots at top, current step glowing blue.

**Integration cards (Gmail, Google Calendar):**
- Large cards (not small rows — make them feel important)
- Each card: icon (Google logo or custom SVG), service name, description, status pill
- **Not connected:** card has `MovingBorder` (Aceternity) around it — slow rotating gradient border, CTA: "Connect" button (ShimmerButton)
- **Connected:** card has a green success glow, animated checkmark reveal, status pill: "Connected" in green
- **Connecting:** spinner + "Authorizing…" text
- Hover: subtle card lift with shadow increase

**Continue button:** Disabled until all connected. On enable → fades in with `BlurFade` (Magic UI). Clicking animates to fill the button then route transition.

---

### 3. App Shell

**File:** `app/(app)/layout.tsx`, `components/layout/`

#### Desktop (lg+): Three-column + status bar

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [Nav Rail 64px] │  [List Panel 320px]     │  [Detail Panel flex-1]    │
│                  │                          │                           │
│  ◉ Corsair logo  │  ┌─ Search bar ────────┐ │                           │
│  ─────────────   │  │ 🔍 Search mail...    │ │                           │
│  ✉ Mail (active) │  └────────────────────┘ │                           │
│  📅 Calendar     │  [Tab: Inbox|Sent|Drafts]│                           │
│  🤖 Agent        │  [Thread rows...]        │                           │
│  ──────────────  │                          │                           │
│  ⚙ Settings     │                          │                           │
│  [User avatar]   │                          │                           │
│────────────────────────────────────────────────────────────────────────│
│  STATUS BAR: 📬 Inbox · 12 unread    ⚡ AI active    [j/k to navigate] │
└─────────────────────────────────────────────────────────────────────────┘
```

**Nav Rail (`components/layout/nav-rail.tsx`):**
- 64px width, `bg-card border-r border-border`
- Top: Corsair logo/icon (links to `/`)
- Nav icons (Phosphor): Mail, Calendar, Robot, GearSix
- Active state: icon switches to `fill` weight, background `bg-primary/15`, left 2px accent bar
- Tooltip on hover (shadcn `Tooltip`) showing label + keyboard shortcut (e.g., "Mail — g m")
- Unread count badge on Mail icon (small amber circle with count)
- Bottom: User avatar (initials circle), clicking opens settings popover
- `framer-motion` layout animation on active indicator sliding between icons

**Status Bar (`components/layout/status-bar.tsx`):** 
- Fixed 28px bar at absolute bottom, full width, z-50
- `bg-[var(--status-bar)] border-t border-border text-xs font-mono`
- Left section: current folder name + unread count
- Center section: AI activity (idle: nothing; during webhook: "⚡ Classifying 3 emails…" with animated shimmer text)
- Right section: current keyboard mode hint (context-aware: changes based on active panel)
- Hidden on mobile (replaced by bottom tab bar)

#### Tablet (md): Collapsed list panel
- List panel collapses to icon-only on tablet, expands on tap
- Detail takes full width
- `react-resizable-panels` for drag-to-resize between list and detail

#### Mobile (sm): Bottom tab bar + full-screen views

**`components/layout/mobile-tab-bar.tsx`:**
- Fixed bottom bar (48px), safe-area-aware padding
- 4 tabs: Mail, Calendar, Agent, Settings
- Active tab: icon filled + label visible + small underline indicator
- Badge on Mail tab for unread count
- Hidden on lg+ screens

**Mobile navigation:**
- `/mail` → thread list (full screen)
- `/mail?thread=X` → thread detail slides in from right (AnimatePresence)
- Compose → Vaul `<Drawer>` bottom sheet, full height
- Search → full-screen overlay

---

### 4. Mail — Thread List Panel

**File:** `components/mail/thread-list.tsx`, `components/mail/thread-row.tsx`

#### Search Bar (top, sticky)
- `components/mail/search-bar.tsx`
- `h-11 bg-muted/50 border border-border rounded-lg`
- Phosphor `MagnifyingGlass` icon left, clear button right when has value
- Pressing `/` globally focuses it
- On focus: expands to show filter chips row below: From | To | Subject | Date | Priority
- Each chip is a toggle button — active chips have blue background
- Debounced 300ms → `GET /api/gmail/messages/search`
- Command palette (⌘K) is a separate global overlay (see section 9)

#### Folder Tabs
- `shadcn Tabs` component: Inbox / Sent / Drafts
- Tab indicator animates with `framer-motion` `layoutId="tab-indicator"`
- Unread count badge on Inbox tab

#### Thread Rows (`components/mail/thread-row.tsx`)

Full redesign from current version:

```
┌──────────────────────────────────────────────────────────────┐
│ ●  [Avatar]  [Sender 14px bold/normal]      [timestamp 12px] │
│    [Subject 13px medium]           [⚡ High badge] [📎 icon]  │
│    [Snippet 12px muted, 1 line truncated]                    │
│                                              [quick actions] │ ← appear on hover
└──────────────────────────────────────────────────────────────┘
```

Row anatomy:
- **Left edge 3px:** Unread = primary blue, Selected = solid primary, Read = transparent
- **Unread dot:** 6px `bg-primary rounded-full` visible when unread
- **Avatar:** 32px circle, gradient background seeded from sender name, white initials (Geist Mono). Color seeded deterministically from name (6-color palette: blue, violet, emerald, orange, rose, teal).
- **Sender name:** 14px, `font-semibold` if unread, `font-normal text-muted-foreground` if read
- **Timestamp:** right-aligned 12px muted (`date-fns` formatting)
- **Subject:** 13px, medium weight if unread
- **Priority badge (`components/mail/priority-badge.tsx`):** 
  - High: `⚡` + "High" — amber background `bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] px-1.5 py-0.5 rounded`
  - Low: "Low" — muted gray, only visible on hover
  - Medium: no badge
- **Attachment icon:** paper clip icon (small) when message has attachments
- **Thread count chip:** "3" small chip when thread has multiple messages
- **Quick actions (hover only):** Archive, Star, Delete — slide in from right with `framer-motion` `x: 10 → 0`
- **Row height:** 72px
- **Hover:** `bg-[var(--thread-hover)]` (subtle lift)
- **Selected:** `bg-[var(--thread-selected)]` + left border accent
- **Keyboard focus:** same as selected (accessible)

**Animation:** New threads arriving (from webhook) animate in from top with `BlurFade` from Magic UI (100ms, staggered 30ms).

**Skeleton loader:** 8 rows, each with gray shimmer blocks matching exact proportions above.

**Empty state:** Centered icon + "All clear." + "Press `c` to compose." in muted text.

**Virtualization:** Wrap list in `@tanstack/react-virtual` `useVirtualizer` for performance with 50-200+ threads.

---

### 5. Mail — Thread Detail Panel

**File:** `components/mail/thread-detail.tsx`

#### Header
- Sticky top bar: Subject (large, `text-lg font-semibold`) + action toolbar right-aligned
- Action toolbar icons (Phosphor): Archive (`ArchiveBox`), Star, Move to label, Delete, More (`DotsThree`)
- Thread navigation: `←` `→` arrows for previous/next thread (updates URL)
- On mobile: back button (`←` to thread list) + actions

#### Message Timeline
- Each message is a `<details>`-style expand/collapse
- **Collapsed:** one-liner — avatar + sender name + truncated snippet + timestamp → click to expand
- **Expanded (latest by default):**
  - Full message header: sender avatar + name + email + to/cc fields (click to expand recipients)
  - Timestamp: "Today at 3:45 PM" format
  - Message body: HTML emails in sandboxed `<iframe>` with dark-mode injected CSS; plain text as `<pre>` with line wrapping
  - "View original" toggle for HTML emails
  - Attachments list at bottom: icon + filename + size + download button
- Smooth expand/collapse: `framer-motion` height animation `initial={{height: 0}} animate={{height: "auto"}}`

#### Reply Toolbar (bottom, sticky)
- `components/mail/reply-toolbar.tsx`
- Fixed bottom bar `h-14 border-t`
- Buttons: Reply (`r`) / Reply All (`a`) / Forward (`f`) / Archive (`e`) / Delete (`#`)
- Each button shows keyboard shortcut as tooltip
- Reply opens inline composer WITHIN the thread detail (not floating)

#### Inline Reply Composer
- Appears below the last message with `BlurFade` entrance
- Tiptap rich text editor (see Compose section for full spec)
- Compact mode: To/Subject pre-filled for reply, body focused
- Send button + keyboard hint (⌘+Enter)
- Closing collapses with exit animation

---

### 6. Compose Window (Floating)

**File:** `components/mail/compose-window.tsx`

Full redesign from current textarea-based version.

#### States
1. **Floating (default):** 440px × 520px, fixed bottom-right (`right-6 bottom-0`)
2. **Minimized:** 320px × 44px tab at bottom right, shows subject or "New Message"
3. **Full-screen:** modal overlay with centered 860px × 90vh content area
4. **Multiple windows:** stack horizontally, rightmost is active, others shown as tabs

#### Structure
```
┌─ Title bar ─────────────────────── [─] [⤢] [✕] ─┐
│ New Message                                        │
├────────────────────────────────────────────────────┤
│ To:  [tag input with autocomplete]                 │
├──────────────────────────────────────────────────  │
│ Cc:  [input]                          [+ Bcc]      │
├────────────────────────────────────────────────────┤
│ Subject: [input]                                   │
├────────────────────────────────────────────────────┤
│ [Formatting toolbar: B I U ─ Link · List ≡ Code ]  │
│                                                    │
│  Tiptap editor body                               │
│                                                    │
│                                                    │
├────────────────────────────────────────────────────┤
│ [Attach 📎]  [Discard 🗑]       [Draft] [Send ⌘↵] │
└────────────────────────────────────────────────────┘
```

**Title bar:** `bg-card/80 backdrop-blur-md border-b`, grab handle in center for drag. Minimize/fullscreen/close buttons.

**To field:** Tag input — type an email → press Enter or comma → becomes a pill badge. Autocomplete from sent history shows dropdown. Remove with ×.

**Formatting toolbar (Tiptap):**
- Icons: Bold (B), Italic (I), Underline (U), Strikethrough (S̶), Link (🔗), Code (`</>`)
- Separator
- Bullet list, Ordered list, Blockquote
- Active state: button `bg-primary/20 text-primary`
- Toolbar uses Phosphor icons

**Tiptap Editor body:** `flex-1 overflow-y-auto px-4 py-3 text-sm leading-relaxed` with Placeholder extension showing "Write your message…"

**Animation:** Compose window animates in with `framer-motion`: `y: 20 → 0, opacity: 0 → 1` (200ms spring stiffness 300, damping 30).

**Draft auto-save:** Debounced 3s after last keystroke → `POST /api/gmail/drafts` → Sonner toast "Draft saved" (2s, bottom-right).

**On close with content:** Dialog prompt "Save draft?" → yes saves, no discards.

---

### 7. Calendar Week View

**File:** `components/calendar/week-view.tsx`, `app/(app)/calendar/page.tsx`

#### Layout
- Detail panel takes full width (list panel hides when on calendar)
- OR: List panel shows upcoming events for the week (alternative — cleaner)
- Calendar occupies the flex-1 space

#### Week Header
- Left: `←` button (`[` key), right: `→` button (`]` key), center: "June 16–22, 2026"
- "Today" button (highlighted when not on current week)
- "Sync" button with refresh icon
- Day column headers: "Mon 16" format, today's date circled with `bg-primary text-primary-foreground rounded-full`
- All-day events banner row below header

#### Time Grid
- Left axis: hour labels (7am, 8am…) in muted mono text
- CSS grid: 7 columns × time rows
- Horizontal hour lines: `border-b border-border/20`
- Current time indicator: red horizontal line with dot at left (`position: absolute`, updated every minute)
- Default scroll position: 7am

#### Event Blocks (`components/calendar/event-block.tsx`)
- Absolute positioned within column based on `(startMinute / 60) * rowHeight`
- Height = `(durationMinutes / 60) * rowHeight`
- Color: seeded from calendar ID (6 colors: blue, violet, emerald, rose, orange, teal)
- Style: `rounded bg-{color}/30 border-l-2 border-{color} text-{color}-200`
- Content: event title (bold, 12px) + time range (10px, if tall enough)
- Hover: scale(1.01) + shadow elevation + cursor pointer
- Click: `EventPopover` component anchored to block

#### Event Popover (`components/calendar/event-popover.tsx`)
- Radix Popover positioned relative to event block
- Shows: title, time, attendees (avatar circles with overflow count "+2"), description
- Action buttons: Edit, Delete
- Keyboard: Escape to close

#### Create Event Modal (`components/calendar/create-event-modal.tsx`)
- Triggered by `n` key or "New Event" button
- `shadcn Dialog` centered modal
- Fields: Title (autofocused), Date picker, Start time, End time, Attendees (tag input), Description (expandable), Location (expandable), "Notify attendees" switch
- "Create & Send Invite" CTA + "Create Only" secondary button
- `framer-motion` fade + scale entrance

#### Mobile Calendar
- Default: day view (single column)
- Horizontal swipe between days with `embla-carousel`
- Event tap opens full-screen event detail sheet (`vaul`)
- Create event: bottom sheet with same fields

---

### 8. Agent Chat

**File:** `components/agent/chat-panel.tsx`, `app/(app)/agent/page.tsx`

#### Layout
- Full detail-panel width
- List panel: conversation history (list of past agent_conversations)

#### Conversation List (left panel when on agent route)
- Each row: conversation title (first message truncated) + timestamp
- "New conversation" button at top
- Selected conversation highlighted

#### Chat Panel
```
┌────────────────────────────────────────────┐
│ Agent — New Conversation    [+ New]        │
├────────────────────────────────────────────┤
│                                            │
│         [Empty state — initial]            │
│   "Try: What's on my calendar Friday?"    │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │ User message (right, blue bg)        │  │
│  └──────────────────────────────────────┘  │
│                                            │
│ [Agent avatar] [Agent message text...]     │
│                                            │
│ ┌─ Action Card ──────────────────────────┐ │
│ │ ✉️ Sent email to alex@company.com      │ │
│ │ Subject: Q3 sync                       │ │
│ └────────────────────────────────────────┘ │
│                                            │
├────────────────────────────────────────────┤
│ [Input: Ask anything...]          [Send →] │
└────────────────────────────────────────────┘
```

**Message bubbles:**
- User: `bg-primary text-primary-foreground rounded-2xl rounded-br-sm` right-aligned, max-width 70%
- Agent: left-aligned with 28px avatar (Robot icon in circle), `bg-card border border-border rounded-2xl rounded-bl-sm`
- Agent messages: `react-markdown` with `remark-gfm` + `rehype-highlight` for markdown rendering
- Code blocks: Geist Mono, `bg-muted` background, syntax highlighted

**Action cards (`components/agent/action-card.tsx`):**
- Special card shown when agent performs a tool action (send email, create event)
- `bg-primary/10 border border-primary/20 rounded-xl p-3`
- Icon (✉️ or 📅) + action description + key details
- Subtle success border beam animation (Magic UI `BorderBeam`)

**Streaming animation:**
- While SSE streaming: animated cursor `|` blinking at end of text
- `react-markdown` renders as text accumulates
- "Thinking" state: three animated dots (CSS keyframe, stagger 200ms each)

**Input area:**
- `Textarea` auto-growing (max 4 lines)
- Send button → shimmer animation on hover
- `⌘+Enter` to send, `Enter` inserts newline
- Paste-to-quote: pasted text auto-wraps in blockquote

---

### 9. Command Palette / Global Search

**File:** `components/command-palette.tsx`

Triggered by: `⌘K` globally or `/` in thread list.

**Overlay:** Full-screen dark scrim `bg-background/80 backdrop-blur-sm`, centered modal.

**Modal:** `w-[640px] max-h-[480px] bg-card border border-border rounded-xl shadow-2xl overflow-hidden`

**Top:** Large search input with icon, no border of its own (`border-0 shadow-none` on Input)

**Results sections (using shadcn `Command` component):**
- Recent searches (localStorage, top 5)
- Email results: sender avatar + subject + snippet + timestamp
- Calendar events: calendar icon + title + date/time
- Actions: icon + label + shortcut hint (e.g., "Compose new email — c")

**Filter chips row** (below input, above results):
- "From" / "To" / "Subject" / "Date range" / "Priority" chips
- Active chip: `bg-primary/20 border-primary` — adds structured filter to search

**Keyboard navigation:** `↑/↓` or `j/k` through results, `Enter` to select, `Escape` to close.

**Animation:** `framer-motion` `scale: 0.95 → 1, opacity: 0 → 1` (150ms), backdrop fades in separately.

---

### 10. Keyboard Shortcuts Modal

**File:** `components/shortcuts-modal.tsx`

Triggered by `?` key.

**Layout:** `shadcn Dialog` — large modal `max-w-2xl`

**Content:** Grid of shortcut groups:
- Global, Mail List, Thread Detail, Compose, Calendar
- Each group: header + rows of (description | key chip)
- Key chips: `<kbd>` styled with `bg-muted border border-border rounded px-1.5 py-0.5 text-xs font-mono`
- Multi-key sequences: chips separated by "then"

**Search:** Input at top to filter shortcuts by description.

---

### 11. Settings Page

**File:** `app/(app)/settings/page.tsx`

**Layout:** Full detail-panel width, scrollable, max-w content width (~680px centered).

**Sections:**

**Profile:**
- Avatar (large, editable), Name, Email (read-only from Better Auth), Sign Out button (destructive)

**Integrations:**
- Cards for Gmail + Google Calendar (same style as Connect page but less prominent)
- Each shows: status (Connected / Disconnected), last synced time, Reconnect / Disconnect buttons
- Disconnect shows confirmation dialog

**Appearance:**
- Email density: Radio group — Compact (60px rows) / Comfortable (72px) / Spacious (84px)
- Theme: Light / Dark / System (shadcn `ThemeToggle`)

**Notifications (future):** Placeholder section with "Coming soon" badge.

**Danger Zone:**
- "Clear all cached emails" (deletes corsair_entities for this user)
- Red-bordered card

---

### 12. Empty / Loading / Error States

**Loading skeletons:**
- Thread list: 8 shimmer rows (Skeleton from shadcn) matching thread row proportions exactly
- Thread detail: shimmer header + 3 shimmer paragraphs
- Calendar: shimmer week header + 3 ghost event blocks positioned at realistic times
- Agent chat: 3 shimmer message bubbles (alternating user/agent)

**Empty states:**
- Inbox empty: Phosphor `InboxSimple` icon (48px, muted) + "All clear." + "Press `c` to compose."
- Search no results: `MagnifyingGlass` icon + "No messages matching '{query}'" + "Try adjusting your filters."
- Calendar empty week: `CalendarBlank` icon + "No events this week." + "Press `n` to create one."
- Agent new: `Robot` icon + "Ask me anything." + suggestion chips ("What's on my calendar today?", "Summarize unread emails")

**Error states (Sonner toasts):**
- Send failed: "Failed to send — Tap to retry" (persistent, with retry action)
- Sync failed: "Sync error — will retry shortly" (5s)
- General API error: "Something went wrong" (3s)

---

## Mobile Responsive Strategy

| Breakpoint | Layout |
|---|---|
| `< 640px` (sm) | Bottom tab bar, full-screen views, Vaul drawers |
| `640–1024px` (md) | Collapsed list (icon only), resizable panels |
| `1024px+` (lg) | Full 3-column + status bar |

**Mobile-specific behavior:**
- Thread list → tap row → full-screen thread detail (AnimatePresence slide from right)
- Back gesture: swipe right from left edge → go back to list
- Swipe left on thread row → reveal archive button (red bg)
- Swipe right on thread row → reveal mark-read toggle (blue bg)
- Compose: Vaul `<Drawer>` from bottom, snap point at 75% and 100%
- Search: Full-screen `<Sheet>` from top
- Calendar: Day view with embla horizontal swipe between days
- Touch targets: minimum 44×44px for all interactive elements
- Safe area: `pb-[env(safe-area-inset-bottom)]` on bottom bar

---

## Animation Specifications

| Interaction | Library | Duration | Easing |
|---|---|---|---|
| Panel slide-in (thread open) | `framer-motion` | 150ms | ease-out |
| Compose window open | `framer-motion` spring | stiffness 300, damping 30 | — |
| Thread row hover quick-actions | `framer-motion` | 100ms | ease |
| Email list new item arrive | Magic UI `BlurFade` | 100ms, stagger 30ms | ease |
| Command palette open | `framer-motion` | 150ms | ease-out |
| Calendar event hover | CSS | 100ms | ease |
| Tab indicator slide | `framer-motion` `layoutId` | 200ms | spring |
| Toast entrance (Sonner) | Built-in | 350ms | spring |
| Skeleton shimmer | `tw-animate-css` | 1.5s | linear infinite |
| Status bar AI text shimmer | React Bits shiny text | 2s | linear |
| Compose minimize | `framer-motion` height | 150ms | ease-in-out |
| Mobile thread detail slide | `framer-motion` | 200ms | ease-out |

**`prefers-reduced-motion`:** Wrap all `framer-motion` animations with the `useReducedMotion` hook — reduce to opacity-only fades.

---

## New Files to Create

```
components/
  layout/
    nav-rail.tsx              # Enhanced nav rail with tooltips, badge, user avatar
    status-bar.tsx            # VS Code-style bottom status bar (desktop only)
    mobile-tab-bar.tsx        # Bottom tab navigation for mobile
  mail/
    search-bar.tsx            # Search + filter chips, global command trigger
    compose-toolbar.tsx       # Tiptap formatting toolbar component
    priority-badge.tsx        # High/low priority badge component
    sender-avatar.tsx         # Deterministic color gradient avatar with initials
    reply-toolbar.tsx         # Bottom bar with Reply/Archive/Delete actions
    thread-actions.tsx        # Archive, star, move, delete action buttons
    inline-reply.tsx          # Tiptap-based inline reply within thread detail
  calendar/
    week-view.tsx             # Full time-grid week calendar
    day-column.tsx            # Single day column with positioned events
    event-block.tsx           # Event block with popover
    event-popover.tsx         # Event detail popover
    create-event-modal.tsx    # New event form modal
  agent/
    chat-panel.tsx            # Main chat interface
    message-bubble.tsx        # User/agent message bubble
    action-card.tsx           # Tool-use confirmation card
    typing-indicator.tsx      # Animated ellipsis while streaming
    conversation-list.tsx     # Past conversations sidebar
  ui/
    aurora-background.tsx     # Aceternity — animated gradient bg for auth
    moving-border.tsx         # Aceternity — animated border for connect cards
    blur-fade.tsx             # Magic UI — fade+blur entrance animation
    border-beam.tsx           # Magic UI — animated border beam
    shimmer-button.tsx        # Magic UI — shimmering CTA button
  command-palette.tsx         # Global ⌘K search overlay
  shortcuts-modal.tsx         # ? keyboard shortcut reference modal

hooks/
  use-keyboard-shortcuts.ts   # Global shortcut registration with sequence support
  use-compose.ts              # Compose window open/close/minimize state
  use-thread-navigation.ts    # j/k navigation + URL sync

app/(app)/
  settings/page.tsx           # Settings page (currently stub)
  calendar/page.tsx           # Calendar page (currently stub)  
  agent/page.tsx              # Agent chat page (currently stub)
```

**Modify existing:**
- `app/(app)/layout.tsx` — add `StatusBar`, wrap children with `framer-motion` AnimatePresence, add mobile tab bar
- `components/app-nav.tsx` → replace with `components/layout/nav-rail.tsx`
- `components/mail/thread-list.tsx` — add virtualization, new search bar, folder tabs
- `components/mail/thread-row.tsx` — full visual redesign (sender avatar, quick actions, hover animations)
- `components/mail/thread-detail.tsx` — sticky header, message expand/collapse animation, inline reply
- `components/mail/compose-window.tsx` — replace Textarea with Tiptap, add formatting toolbar, multi-window support
- `app/globals.css` — add new CSS custom properties
- `app/(auth)/login/page.tsx` — aurora split-screen layout
- `app/(auth)/signup/page.tsx` — aurora split-screen layout
- `app/connect/page.tsx` — large integration cards with moving border

---

## Verification Steps

After implementation, manually verify:

1. **Auth:** Login page renders aurora background (desktop) + form card; mobile shows stacked layout; social auth redirects work
2. **Connect:** Integration cards show MovingBorder when not connected; success state shows green checkmark; "Continue" enables after both connected
3. **Shell:** Nav rail shows unread badge on Mail icon; status bar appears at bottom (desktop only); mobile shows bottom tab bar; resizable panels work
4. **Thread list:** Skeleton renders during load; new emails animate in with BlurFade; hover reveals quick actions; keyboard j/k navigation works; search bar filters results; priority badges show correctly
5. **Thread detail:** Latest message expanded, rest collapsed; HTML email renders in iframe with dark styles; Reply opens inline composer; Archive/Delete keyboard shortcuts work; next/prev navigation works
6. **Compose:** Window slides up from bottom-right; Tiptap formatting toolbar functional; tag input for To field; ⌘+Enter sends; minimizes to tab; full-screen toggle; draft auto-saves
7. **Calendar:** Week grid renders with time lines; events positioned correctly by start/end; today column highlighted; [ / ] keys navigate weeks; click event shows popover; n key opens create modal
8. **Agent chat:** Messages render with markdown; action cards appear for tool use; streaming text animation works; conversation persists across page nav
9. **Command palette:** ⌘K opens overlay; search filters email + calendar + actions; Escape closes; keyboard navigation with ↑↓
10. **Mobile:** Thread list → tap → full-screen detail → back gesture → list; compose opens as bottom drawer; calendar shows day view with swipe; bottom tab bar visible

Run `pnpm lint && pnpm build` after each major section.

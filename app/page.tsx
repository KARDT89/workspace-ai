import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Corsair Hub — Email built the way you'd build it",
  description:
    "Keyboard-first inbox and calendar for developers. AI priority scoring, natural-language agent actions, built on Corsair.",
};

// ─── inline SVG icons (server-component safe) ─────────────────────────────────

function IconMail({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
      <path d="M1.5 6l6.5 4 6.5-4" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
    </svg>
  );
}

function IconCalendar({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="1.5" y="3.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
      <path d="M5 1.5v4M11 1.5v4M1.5 7.5h13" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function IconRobot({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="2" y="5.5" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="5.5" cy="9.5" r="1" fill="currentColor" />
      <circle cx="10.5" cy="9.5" r="1" fill="currentColor" />
      <path d="M8 5.5V3M6.5 13.5h3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <path d="M6 3h4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function IconGear({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.58 3.58l1.41 1.41M11.01 11.01l1.41 1.41M3.58 12.42l1.41-1.41M11.01 4.99l1.41-1.41"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconArrow({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCheck({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none" aria-hidden>
      <path d="M2 5.5l2 2L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── app preview mockup ───────────────────────────────────────────────────────

const THREADS = [
  {
    initials: "AC",
    sender: "Alex Chen",
    subject: "Re: Q3 roadmap",
    snippet: "Just followed up on the timeline…",
    time: "2m",
    unread: true,
    priority: "high" as const,
    active: true,
  },
  {
    initials: "SK",
    sender: "Sarah K.",
    subject: "Invoice #4521 ready",
    snippet: "Please find the attached invoice…",
    time: "1h",
    unread: true,
  },
  {
    initials: "GH",
    sender: "GitHub",
    subject: "PR #42 merged in corsair-hub",
    snippet: "Add email prioritization was merged…",
    time: "3h",
  },
  {
    initials: "NW",
    sender: "Notion Weekly",
    subject: "Your weekly digest",
    snippet: "Here's what happened this week…",
    time: "Yest",
  },
];

function AppPreview() {
  return (
    <div className="relative">
      <div
        className="rounded-xl border border-border overflow-hidden"
        style={{
          boxShadow:
            "0 40px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Window chrome */}
        <div className="h-7 bg-[#0d0d0d] border-b border-border flex items-center gap-1.5 px-3">
          {(["#3a3a3a", "#3a3a3a", "#3a3a3a"] as const).map((c, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
          ))}
          <span className="ml-2 font-mono text-[10px] text-muted-foreground">
            corsair-hub — Mail
          </span>
        </div>

        {/* 3-panel shell */}
        <div className="flex h-[420px]">
          {/* Nav rail */}
          <div className="w-12 bg-[#0d0d0d] border-r border-border flex flex-col items-center py-2 gap-0.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <IconMail size={14} />
            </div>
            {[IconCalendar, IconRobot].map((Icon, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#444]"
              >
                <Icon size={14} />
              </div>
            ))}
            <div className="mt-auto w-8 h-8 rounded-lg flex items-center justify-center text-[#444]">
              <IconGear size={14} />
            </div>
          </div>

          {/* Thread list */}
          <div className="w-[260px] shrink-0 bg-[#0d0d0d] border-r border-border flex flex-col">
            {/* Search bar */}
            <div className="p-2 border-b border-border shrink-0">
              <div className="flex items-center gap-1.5 bg-[#1a1a1a] rounded px-2.5 py-1.5 text-[10px] text-muted-foreground">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                  <circle cx="4" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M6.5 6.5l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                Search&hellip;
                <span className="ml-auto font-mono opacity-40">/</span>
              </div>
            </div>

            {/* Thread rows */}
            <div className="overflow-hidden">
              {THREADS.map((t, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 px-2.5 py-2 border-b border-border/50 ${
                    t.active ? "bg-[#141414]" : ""
                  }`}
                  style={
                    t.active
                      ? { borderLeft: "2px solid var(--primary)" }
                      : { borderLeft: "2px solid transparent" }
                  }
                >
                  <div className="mt-2 shrink-0 w-1.5 h-1.5">
                    {t.unread && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#1c1c1c] border border-border flex items-center justify-center text-[8px] font-semibold text-muted-foreground shrink-0">
                    {t.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-[10px] truncate leading-tight ${
                          t.unread ? "font-semibold text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {t.sender}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        {t.priority === "high" && (
                          <span className="text-[7px] font-mono font-semibold" style={{ color: "#f59e0b" }}>
                            ⚡
                          </span>
                        )}
                        <span className="text-[9px] text-muted-foreground/50">{t.time}</span>
                      </div>
                    </div>
                    <div
                      className={`text-[9px] truncate leading-tight ${
                        t.unread ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {t.subject}
                    </div>
                    <div className="text-[9px] text-muted-foreground/50 truncate leading-tight">
                      {t.snippet}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detail panel */}
          <div className="flex-1 flex flex-col overflow-hidden bg-background min-w-0">
            <div className="px-4 py-3 border-b border-border shrink-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold mb-0.5 leading-tight">Re: Q3 roadmap</div>
                  <div className="text-[9px] text-muted-foreground">
                    Alex Chen &lt;alex@company.io&gt;
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className="text-[8px] font-mono font-semibold px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: "rgba(245,158,11,0.12)", color: "#f59e0b" }}
                  >
                    ⚡ High
                  </span>
                  <span className="text-[9px] text-muted-foreground">9:41 AM</span>
                </div>
              </div>
            </div>
            <div className="flex-1 px-4 py-3 text-[10px] leading-relaxed text-muted-foreground overflow-hidden">
              <p className="mb-2">Morning,</p>
              <p className="mb-2">
                Just followed up on the Q3 timeline doc. Pushed updated milestones to Notion —
                can you look before standup? Main change is calendar sync moved to week 2 so we
                nail email core first.
              </p>
              <p className="mb-3 text-foreground/60">
                Webhook latency looks great. &lt;5s avg. Shipping Thursday?
              </p>
              <p>— A</p>
            </div>
            <div className="px-3 py-2 border-t border-border bg-[#0d0d0d] shrink-0">
              <div className="flex items-center gap-2 bg-[#1a1a1a] rounded px-3 py-1.5 text-[10px] text-muted-foreground/40">
                <span>Reply to Alex&hellip;</span>
                <span className="ml-auto font-mono text-[9px]">⌘↵ send</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating shortcut hint */}
      <div className="absolute -bottom-3 -right-2 flex items-center gap-1.5 bg-card border border-border rounded-full px-3 py-1.5 shadow-xl text-[11px] font-mono text-muted-foreground">
        <kbd className="text-[10px] bg-muted border border-border px-1.5 py-0.5 rounded text-foreground">
          j
        </kbd>
        <kbd className="text-[10px] bg-muted border border-border px-1.5 py-0.5 rounded text-foreground">
          k
        </kbd>
        <span>navigate</span>
      </div>
    </div>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 h-12 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded bg-primary flex items-center justify-center shrink-0">
            <span className="text-white text-[9px] font-black leading-none select-none">C</span>
          </div>
          <span className="text-sm font-semibold tracking-tight">Corsair Hub</span>
        </div>
        <div className="flex items-center gap-5">
          <span className="text-[11px] font-mono text-muted-foreground hidden md:block">
            Phase 1 complete
          </span>
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in →
          </Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="min-h-[calc(100vh-3rem)] pt-12 flex items-center">
        <div className="w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-16 xl:gap-24 items-center py-20">

          {/* Copy */}
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-mono text-muted-foreground border border-border rounded-full px-3 py-1 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              Email + Calendar client for power users
            </div>

            <h1
              className="font-bold tracking-tighter leading-[0.88] mb-7"
              style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)" }}
            >
              Email built<br />
              the way<br />
              <span className="text-primary">you&apos;d build it.</span>
            </h1>

            <p className="text-base text-muted-foreground leading-relaxed mb-10 max-w-[360px]">
              Keyboard-first inbox and calendar. Every email scored by AI before you
              open it. A natural-language agent handles the rest — on your infrastructure.
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-primary text-white text-sm font-medium px-4 py-2.5 rounded-md hover:bg-primary/90 transition-colors"
              >
                Get started
                <IconArrow />
              </Link>
              <Link
                href="/connect"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Connect Gmail →
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-8 flex-wrap">
              {(
                [
                  ["< 200ms", "inbox load"],
                  ["40+", "shortcuts"],
                  ["0 clicks", "to archive"],
                ] as const
              ).map(([stat, label], i) => (
                <div key={label} className="flex items-center gap-8">
                  {i > 0 && <div className="w-px h-7 bg-border" />}
                  <div>
                    <div className="text-base font-semibold tabular-nums">{stat}</div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* App preview */}
          <div className="hidden lg:block">
            <AppPreview />
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
      <section className="border-t border-border py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-12">
            Why Corsair Hub
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 md:divide-x md:divide-border">
            {[
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                    <path
                      d="M10 2l2.39 5.26L18 8.18l-4 3.9.95 5.58L10 15.12l-4.95 2.54L6 12.08 2 8.18l5.61-.92L10 2Z"
                      stroke="#f59e0b"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                      fill="rgba(245,158,11,0.1)"
                    />
                  </svg>
                ),
                title: "AI priority scoring",
                body: "Every incoming email classified High, Medium, or Low before you open your inbox. Powered by a lightweight model — no GPT-4 costs per message.",
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                    <rect x="2" y="5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.4" />
                    <path
                      d="M6 9.5h2M10 9.5h2M14 9.5h2M6 13h2M10 13h2"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                ),
                title: "Keyboard-first",
                body: "Navigate your entire inbox without touching the mouse. j/k to move, r to reply, e to archive, / to search. The shortcuts Superhuman proved work.",
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                    <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4" />
                    <path
                      d="M10 2v3M10 15v3M2 10h3M15 10h3M4.22 4.22l2.12 2.12M13.66 13.66l2.12 2.12M4.22 15.78l2.12-2.12M13.66 6.34l2.12-2.12"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                ),
                title: "Built on Corsair",
                body: "Corsair handles auth, caching, and webhooks for every integration. Slack, Linear, GitHub are next — one agent surface for all of it.",
              },
            ].map(({ icon, title, body }, i) => (
              <div key={i} className="md:px-8 first:md:pl-0 last:md:pr-0">
                <div className="mb-4 text-muted-foreground">{icon}</div>
                <h3 className="text-sm font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AGENT SECTION ────────────────────────────────────────────────────── */}
      <section className="border-t border-border py-20 px-6 bg-card">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-6">
              Agent chat
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-5">
              One sentence.<br />
              Ten clicks saved.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8 max-w-sm">
              Type what you need in plain English. The agent reads your email, checks your
              calendar, and acts — sending messages, creating events, drafting replies — while
              you watch.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline underline-offset-4"
            >
              Start building <IconArrow size={13} />
            </Link>
          </div>

          {/* Agent chat mock */}
          <div
            className="rounded-xl border border-border overflow-hidden"
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.7)" }}
          >
            <div className="h-7 bg-[#0d0d0d] border-b border-border flex items-center px-3 gap-1.5">
              {(["#3a3a3a", "#3a3a3a", "#3a3a3a"] as const).map((c, i) => (
                <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
              ))}
              <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                corsair-hub — Agent
              </span>
            </div>
            <div className="bg-background p-4 space-y-3 min-h-[260px]">
              <div className="flex justify-end">
                <div className="bg-primary/10 border border-primary/20 text-primary text-xs px-3 py-2 rounded-xl max-w-[80%] leading-relaxed">
                  Send a calendar invite to alex@company.io for next Thursday at 2pm. Subject
                  &ldquo;Q3 sync&rdquo;. Also email him that I look forward to it.
                </div>
              </div>
              <div className="flex justify-start">
                <div className="text-xs text-muted-foreground bg-card border border-border px-3 py-2 rounded-xl max-w-[80%] leading-relaxed space-y-2">
                  <p>On it — creating the event first, then sending the email.</p>
                  {[
                    { label: "Event created", detail: "Q3 sync · Thu Jun 25, 2:00 PM · alex@company.io invited" },
                    { label: "Email sent", detail: "To: alex@company.io · Subject: Q3 sync" },
                  ].map(({ label, detail }) => (
                    <div
                      key={label}
                      className="rounded-lg border px-3 py-2"
                      style={{
                        backgroundColor: "rgba(34,197,94,0.05)",
                        borderColor: "rgba(34,197,94,0.2)",
                      }}
                    >
                      <div
                        className="flex items-center gap-1.5 text-[10px] font-semibold mb-0.5"
                        style={{ color: "#22c55e" }}
                      >
                        <IconCheck />
                        {label}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-3 py-2 border-t border-border bg-[#0d0d0d]">
              <div className="flex items-center gap-2 bg-[#1a1a1a] rounded px-3 py-1.5 text-[10px] text-muted-foreground/40">
                <span>Ask the agent&hellip;</span>
                <span className="ml-auto font-mono text-[9px]">⌘↵</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SHORTCUTS ────────────────────────────────────────────────────────── */}
      <section className="border-t border-border py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">
                Keyboard shortcuts
              </p>
              <h2 className="text-3xl font-bold tracking-tight">
                Everything at your fingertips.
              </h2>
            </div>
            <span className="text-xs font-mono text-muted-foreground border border-border rounded px-2 py-1">
              ? for full cheat sheet
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                label: "Mail",
                items: [
                  ["j / k", "Navigate threads"],
                  ["r", "Reply"],
                  ["a", "Reply all"],
                  ["e", "Archive"],
                  ["c", "Compose"],
                  ["#", "Delete"],
                ],
              },
              {
                label: "Global",
                items: [
                  ["/", "Focus search"],
                  ["g m", "Go to Mail"],
                  ["g c", "Go to Calendar"],
                  ["g a", "Go to Agent"],
                  ["⌘↵", "Send message"],
                  ["?", "Show shortcuts"],
                ],
              },
            ].map(({ label, items }) => (
              <div key={label}>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4">
                  {label}
                </p>
                <div className="space-y-0">
                  {items.map(([key, action]) => (
                    <div
                      key={key}
                      className="flex items-center gap-4 py-2.5 border-b border-border/50"
                    >
                      <kbd className="font-mono text-xs bg-muted border border-border px-2 py-1 rounded text-foreground min-w-[3.5rem] text-center">
                        {key}
                      </kbd>
                      <span className="text-sm text-muted-foreground">{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────────── */}
      <section className="border-t border-border py-24 px-6 bg-card">
        <div className="max-w-2xl mx-auto text-center">
          <h2
            className="font-bold tracking-tighter mb-5 leading-tight"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            Own your inbox.
          </h2>
          <p className="text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed">
            Connect your Gmail and Calendar. Takes two minutes. Your data stays on your
            infrastructure.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-primary text-white font-medium px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
            >
              Get started
              <IconArrow size={15} />
            </Link>
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Already have an account →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary flex items-center justify-center shrink-0">
              <span className="text-white text-[7px] font-black leading-none select-none">C</span>
            </div>
            <span className="text-xs font-semibold tracking-tight text-muted-foreground">
              Corsair Hub
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Built on <span className="text-foreground font-medium">Corsair</span> ·
            Phase 1 complete · Phase 2 in progress
          </p>
        </div>
      </footer>
    </div>
  );
}

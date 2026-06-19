import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentSession } from "@/lib/betterauth/session";

export const metadata: Metadata = {
  title: "Corsair Hub — Email built the way you'd build it",
  description:
    "Keyboard-first inbox and calendar for developers. AI priority scoring, natural-language agent actions, built on Corsair.",
};

// ─── icons ────────────────────────────────────────────────────────────────────

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
        stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"
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

function IconCheck({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M2 6.5l2.5 2.5L10 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCheckSmall({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none" aria-hidden>
      <path d="M2 5.5l2 2L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── app preview ──────────────────────────────────────────────────────────────

const THREADS = [
  { initials: "AC", sender: "Alex Chen",     subject: "Re: Q3 roadmap",          snippet: "Just followed up on the timeline…",  time: "2m",   unread: true,  priority: "high" as const, active: true },
  { initials: "SK", sender: "Sarah K.",      subject: "Invoice #4521 ready",      snippet: "Please find the attached invoice…",  time: "1h",   unread: true },
  { initials: "GH", sender: "GitHub",        subject: "PR #42 merged",            snippet: "Add email prioritization was…",       time: "3h" },
  { initials: "NW", sender: "Notion Weekly", subject: "Your weekly digest",       snippet: "Here's what happened this week…",    time: "Yest" },
];

function AppPreview() {
  return (
    <div className="relative">
      {/* Glow behind the preview */}
      <div
        className="absolute inset-0 -z-10 blur-3xl opacity-20 rounded-2xl"
        style={{ background: "radial-gradient(ellipse at 50% 50%, #3b82f6, transparent 70%)" }}
      />
      <div
        className="rounded-xl overflow-hidden"
        style={{
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow:
            "0 0 0 1px rgba(59,130,246,0.12), 0 40px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Window chrome */}
        <div className="h-7 bg-[#0a0a0a] border-b border-white/5 flex items-center gap-1.5 px-3">
          {(["#ff5f57", "#febc2e", "#28c840"] as const).map((c, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c, opacity: 0.6 }} />
          ))}
          <span className="ml-2 font-mono text-[10px] text-white/25">corsair-hub — Mail</span>
        </div>

        {/* 3-panel shell */}
        <div className="flex h-105">
          {/* Nav rail */}
          <div className="w-12 bg-[#0a0a0a] border-r border-white/5 flex flex-col items-center py-2 gap-0.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center text-primary" style={{ boxShadow: "0 0 12px rgba(59,130,246,0.2)" }}>
              <IconMail size={14} />
            </div>
            {[IconCalendar, IconRobot].map((Icon, i) => (
              <div key={i} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: "rgba(255,255,255,0.2)" }}>
                <Icon size={14} />
              </div>
            ))}
            <div className="mt-auto w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: "rgba(255,255,255,0.2)" }}>
              <IconGear size={14} />
            </div>
          </div>

          {/* Thread list */}
          <div className="w-60 shrink-0 bg-[#0a0a0a] border-r border-white/5 flex flex-col">
            <div className="p-2 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-1.5 bg-white/5 rounded-md px-2.5 py-1.5 text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                  <circle cx="4" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M6.5 6.5l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                Search&hellip;
                <span className="ml-auto font-mono opacity-40">/</span>
              </div>
            </div>
            <div className="overflow-hidden">
              {THREADS.map((t, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 px-2.5 py-2 border-b border-white/4"
                  style={{
                    background: t.active ? "rgba(255,255,255,0.04)" : undefined,
                    borderLeft: t.active ? "2px solid rgba(59,130,246,0.8)" : "2px solid transparent",
                  }}
                >
                  <div className="mt-2 shrink-0 w-1.5 h-1.5">
                    {t.unread && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  </div>
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[7px] font-bold shrink-0"
                    style={{ background: "rgba(59,130,246,0.2)", color: "#93c5fd" }}
                  >
                    {t.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] truncate" style={{ color: t.unread ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)", fontWeight: t.unread ? 600 : 400 }}>
                        {t.sender}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        {t.priority === "high" && (
                          <span className="text-[7px] font-semibold" style={{ color: "#f59e0b" }}>⚡</span>
                        )}
                        <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.2)" }}>{t.time}</span>
                      </div>
                    </div>
                    <div className="text-[9px] truncate" style={{ color: t.unread ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)" }}>
                      {t.subject}
                    </div>
                    <div className="text-[9px] truncate" style={{ color: "rgba(255,255,255,0.2)" }}>{t.snippet}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detail panel */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#080808] min-w-0">
            <div className="px-4 py-3 border-b border-white/5 shrink-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold mb-0.5" style={{ color: "rgba(255,255,255,0.9)" }}>Re: Q3 roadmap</div>
                  <div className="text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>Alex Chen &lt;alex@company.io&gt;</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[8px] font-mono font-semibold px-1.5 py-0.5 rounded" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}>
                    ⚡ High
                  </span>
                  <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.2)" }}>9:41 AM</span>
                </div>
              </div>
            </div>
            <div className="flex-1 px-4 py-3 text-[10px] leading-relaxed overflow-hidden" style={{ color: "rgba(255,255,255,0.4)" }}>
              <p className="mb-2">Morning,</p>
              <p className="mb-2">Just followed up on the Q3 timeline doc. Pushed updated milestones to Notion — can you look before standup?</p>
              <p className="mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>Webhook latency looks great. &lt;5s avg. Shipping Thursday?</p>
              <p>— A</p>
            </div>
            <div className="px-3 py-2 border-t border-white/5 bg-[#0a0a0a] shrink-0">
              <div className="flex items-center gap-2 bg-white/5 rounded-md px-3 py-1.5 text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                <span>Reply to Alex&hellip;</span>
                <span className="ml-auto font-mono text-[9px]">⌘↵ send</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div className="h-6 bg-[#060606] border-t border-white/5 flex items-center px-3 gap-6">
          <span className="font-mono text-[9px]" style={{ color: "rgba(255,255,255,0.25)" }}>📬 Inbox · 2 unread</span>
          <span className="font-mono text-[9px] ml-auto" style={{ color: "rgba(59,130,246,0.6)" }}>⚡ AI active</span>
          <span className="font-mono text-[9px]" style={{ color: "rgba(255,255,255,0.15)" }}>j/k navigate</span>
        </div>
      </div>

      {/* Floating shortcut hint */}
      <div className="absolute -bottom-3 -right-2 flex items-center gap-1.5 bg-[#111] border border-white/10 rounded-full px-3 py-1.5 shadow-xl text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>
        <kbd className="text-[10px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded" style={{ color: "rgba(255,255,255,0.8)" }}>j</kbd>
        <kbd className="text-[10px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded" style={{ color: "rgba(255,255,255,0.8)" }}>k</kbd>
        <span>navigate</span>
      </div>
    </div>
  );
}

// ─── pricing ──────────────────────────────────────────────────────────────────

const PLANS = [
  {
    name: "Hobby",
    price: "Free",
    period: "",
    description: "For personal exploration.",
    badge: null,
    features: [
      "1 Gmail connection",
      "50 AI classifications / mo",
      "Core keyboard shortcuts",
      "10 agent queries / mo",
      "Community support",
    ],
    cta: "Get started",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For power users who live in email.",
    badge: "Most popular",
    features: [
      "Unlimited Gmail accounts",
      "Unlimited AI scoring",
      "Full agent actions",
      "Google Calendar sync",
      "Custom labels & filters",
      "Priority support",
    ],
    cta: "Start free trial",
    href: "/signup?plan=pro",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$49",
    period: "/seat/mo",
    description: "For teams who want one inbox surface.",
    badge: null,
    features: [
      "Everything in Pro",
      "Shared inbox (soon)",
      "Team shortcut configs",
      "Admin dashboard",
      "Audit logs",
      "Dedicated support",
    ],
    cta: "Contact us",
    href: "mailto:talat@octopi.ai",
    highlighted: false,
  },
] as const;

// ─── main ─────────────────────────────────────────────────────────────────────

export default async function Home() {
  const session = await getCurrentSession();
  if (session) redirect("/mail");

  return (
    <div className="min-h-screen text-foreground overflow-x-hidden" style={{ background: "#080808" }}>

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 h-12"
        style={{
          background: "rgba(8,8,8,0.85)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: "#3b82f6", boxShadow: "0 0 12px rgba(59,130,246,0.5)" }}>
            <span className="text-white text-[9px] font-black leading-none select-none">C</span>
          </div>
          <span className="text-sm font-semibold tracking-tight">Corsair Hub</span>
        </div>

        <div className="hidden md:flex items-center gap-7">
          <a href="#features" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#pricing" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          <a href="#agent" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Agent</a>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-md transition-opacity hover:opacity-90"
            style={{ background: "#3b82f6", color: "#fff" }}
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section
        className="min-h-[calc(100vh-3rem)] pt-12 flex items-center relative"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 90% 55% at 50% -5%, rgba(59,130,246,0.13) 0%, transparent 55%),
            radial-gradient(circle at 0.5px 0.5px, rgba(255,255,255,0.04) 0.5px, transparent 0)
          `,
          backgroundSize: "100% 100%, 28px 28px",
        }}
      >
        <div className="w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-16 xl:gap-20 items-center py-20">

          {/* Copy */}
          <div>
            <div
              className="inline-flex items-center gap-2 text-[11px] font-mono border rounded-full px-3 py-1 mb-8"
              style={{ color: "rgba(255,255,255,0.4)", borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: "#3b82f6", animation: "pulse-dot 2s ease-in-out infinite" }}
              />
              Email + Calendar for power users
            </div>

            <h1
              className="font-bold tracking-tighter leading-[0.88] mb-7"
              style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)" }}
            >
              Email built<br />
              the way<br />
              <span style={{ color: "#3b82f6" }}>you&apos;d build it.</span>
            </h1>

            <p className="text-base leading-relaxed mb-10 max-w-90" style={{ color: "rgba(255,255,255,0.45)" }}>
              Keyboard-first inbox and calendar. Every email scored by AI before you open it.
              A natural-language agent handles the rest — on your infrastructure.
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-md transition-opacity hover:opacity-90 group"
                style={{ background: "#3b82f6", color: "#fff", boxShadow: "0 0 24px rgba(59,130,246,0.3)" }}
              >
                Get started free
                <IconArrow />
              </Link>
              <Link
                href="/login"
                className="text-sm transition-colors hover:text-foreground"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Sign in →
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
                  {i > 0 && <div className="w-px h-7" style={{ background: "rgba(255,255,255,0.08)" }} />}
                  <div>
                    <div className="text-base font-semibold tabular-nums">{stat}</div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</div>
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
      <section id="features" className="py-24 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
            Why Corsair Hub
          </p>
          <h2 className="text-3xl font-bold tracking-tight mb-16 max-w-md leading-tight">
            Built for developers who hate context-switching.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                    <path d="M10 2l2.39 5.26L18 8.18l-4 3.9.95 5.58L10 15.12l-4.95 2.54L6 12.08 2 8.18l5.61-.92L10 2Z"
                      stroke="#f59e0b" strokeWidth="1.4" strokeLinejoin="round" fill="rgba(245,158,11,0.1)" />
                  </svg>
                ),
                label: "AI priority scoring",
                body: "Every incoming email classified High, Medium, or Low before you open your inbox. Lightweight model — no GPT-4 costs per message.",
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                    <rect x="2" y="5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M6 9.5h2M10 9.5h2M14 9.5h2M6 13h2M10 13h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                ),
                label: "Keyboard-first",
                body: "Navigate your entire inbox without the mouse. j/k to move, r to reply, e to archive, / to search. The shortcuts Superhuman proved work.",
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                    <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M10 2v3M10 15v3M2 10h3M15 10h3M4.22 4.22l2.12 2.12M13.66 13.66l2.12 2.12M4.22 15.78l2.12-2.12M13.66 6.34l2.12-2.12"
                      stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                ),
                label: "Built on Corsair",
                body: "Corsair handles auth, caching, and webhooks for every integration. Slack, Linear, GitHub are next — one agent surface for all of it.",
              },
            ].map(({ icon, label, body }, i) => (
              <div
                key={i}
                className="p-6 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>{icon}</div>
                <h3 className="text-sm font-semibold mb-2">{label}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)" }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
            Pricing
          </p>
          <h2 className="text-3xl font-bold tracking-tight mb-3">
            Simple, transparent pricing.
          </h2>
          <p className="text-sm mb-16" style={{ color: "rgba(255,255,255,0.4)" }}>
            Start free. Upgrade when you need it. No per-seat surprise fees on Hobby.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className="relative p-6 rounded-xl flex flex-col"
                style={
                  plan.highlighted
                    ? {
                        background: "rgba(59,130,246,0.05)",
                        border: "1px solid rgba(59,130,246,0.35)",
                        boxShadow: "0 0 0 1px rgba(59,130,246,0.12), 0 24px 60px rgba(59,130,246,0.08), 0 0 80px rgba(59,130,246,0.04)",
                        transform: "scale(1.02)",
                        zIndex: 1,
                      }
                    : {
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }
                }
              >
                {/* Badge */}
                {plan.badge && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-semibold px-3 py-1 rounded-full"
                    style={{ background: "#3b82f6", color: "#fff" }}
                  >
                    {plan.badge}
                  </div>
                )}

                {/* Header */}
                <div className="mb-5">
                  <div className="text-xs font-mono uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {plan.name}
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
                    {plan.period && (
                      <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>{plan.period}</span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{plan.description}</p>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
                      <span className="shrink-0 rounded-full w-4 h-4 flex items-center justify-center" style={{ background: "rgba(59,130,246,0.2)", color: "#60a5fa" }}>
                        <IconCheck size={8} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={plan.href}
                  className="block text-center text-xs font-medium py-2.5 rounded-md transition-opacity hover:opacity-85"
                  style={
                    plan.highlighted
                      ? { background: "#3b82f6", color: "#fff" }
                      : { background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.08)" }
                  }
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-xs mt-8" style={{ color: "rgba(255,255,255,0.25)" }}>
            All plans include a 14-day Pro trial. No credit card required.
          </p>
        </div>
      </section>

      {/* ── AGENT ────────────────────────────────────────────────────────────── */}
      <section id="agent" className="py-24 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest mb-6" style={{ color: "rgba(255,255,255,0.3)" }}>
              Agent chat
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-5">
              One sentence.<br />
              Ten clicks saved.
            </h2>
            <p className="leading-relaxed mb-8 max-w-sm text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              Type what you need in plain English. The agent reads your email, checks your calendar,
              and acts — sending messages, creating events, drafting replies — while you watch.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-sm font-medium"
              style={{ color: "#60a5fa" }}
            >
              Try the agent <IconArrow size={13} />
            </Link>
          </div>

          {/* Agent chat mock */}
          <div
            className="rounded-xl overflow-hidden"
            style={{
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
            }}
          >
            <div className="h-7 bg-[#0a0a0a] border-b border-white/5 flex items-center px-3 gap-1.5">
              {(["#ff5f57", "#febc2e", "#28c840"] as const).map((c, i) => (
                <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c, opacity: 0.5 }} />
              ))}
              <span className="ml-2 font-mono text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>corsair-hub — Agent</span>
            </div>
            <div className="p-4 space-y-3 min-h-65" style={{ background: "#080808" }}>
              <div className="flex justify-end">
                <div
                  className="text-xs px-3 py-2 rounded-xl max-w-[80%] leading-relaxed"
                  style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.2)", color: "#93c5fd" }}
                >
                  Send a calendar invite to alex@company.io for next Thursday at 2pm. Subject &ldquo;Q3 sync&rdquo;.
                </div>
              </div>
              <div className="flex justify-start">
                <div
                  className="text-xs px-3 py-2 rounded-xl max-w-[80%] leading-relaxed space-y-2"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)" }}
                >
                  <p>On it — creating the event first, then the email.</p>
                  {[
                    { label: "Event created", detail: "Q3 sync · Thu Jun 25, 2:00 PM" },
                    { label: "Email sent", detail: "To: alex@company.io · Subject: Q3 sync" },
                  ].map(({ label, detail }) => (
                    <div
                      key={label}
                      className="rounded-lg px-3 py-2"
                      style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.18)" }}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold mb-0.5" style={{ color: "#4ade80" }}>
                        <IconCheckSmall />
                        {label}
                      </div>
                      <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-3 py-2 border-t border-white/5 bg-[#0a0a0a]">
              <div className="flex items-center gap-2 bg-white/5 rounded-md px-3 py-1.5 text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                <span>Ask the agent&hellip;</span>
                <span className="ml-auto font-mono text-[9px]">⌘↵</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SHORTCUTS ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
                Keyboard shortcuts
              </p>
              <h2 className="text-3xl font-bold tracking-tight">Everything at your fingertips.</h2>
            </div>
            <span
              className="text-xs font-mono border rounded px-2 py-1"
              style={{ color: "rgba(255,255,255,0.3)", borderColor: "rgba(255,255,255,0.08)" }}
            >
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
                <p className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.25)" }}>
                  {label}
                </p>
                <div className="space-y-0">
                  {items.map(([key, action]) => (
                    <div
                      key={key}
                      className="flex items-center gap-4 py-2.5"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <kbd
                        className="font-mono text-xs px-2 py-1 rounded min-w-14 text-center"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}
                      >
                        {key}
                      </kbd>
                      <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────────── */}
      <section
        className="py-28 px-6"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          backgroundImage: "radial-gradient(ellipse 70% 60% at 50% 100%, rgba(59,130,246,0.1) 0%, transparent 60%)",
        }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 text-[11px] font-mono border rounded-full px-3 py-1 mb-8"
            style={{ color: "rgba(255,255,255,0.35)", borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.025)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            14-day Pro trial · no credit card required
          </div>
          <h2
            className="font-bold tracking-tighter mb-5 leading-tight"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            Own your inbox.
          </h2>
          <p className="mb-10 max-w-md mx-auto leading-relaxed text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Connect your Gmail and Calendar. Takes two minutes.
            Your data stays on your infrastructure.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 font-medium px-6 py-3 rounded-md transition-opacity hover:opacity-90"
              style={{ background: "#3b82f6", color: "#fff", boxShadow: "0 0 32px rgba(59,130,246,0.25)" }}
            >
              Get started free
              <IconArrow size={15} />
            </Link>
            <Link
              href="/login"
              className="text-sm transition-colors hover:text-foreground"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              Already have an account →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="py-8 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded flex items-center justify-center shrink-0"
              style={{ background: "#3b82f6" }}
            >
              <span className="text-white text-[7px] font-black leading-none select-none">C</span>
            </div>
            <span className="text-xs font-semibold tracking-tight" style={{ color: "rgba(255,255,255,0.3)" }}>
              Corsair Hub
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#pricing" className="text-xs hover:text-foreground transition-colors" style={{ color: "rgba(255,255,255,0.25)" }}>Pricing</a>
            <Link href="/login" className="text-xs hover:text-foreground transition-colors" style={{ color: "rgba(255,255,255,0.25)" }}>Sign in</Link>
            <Link href="/signup" className="text-xs hover:text-foreground transition-colors" style={{ color: "rgba(255,255,255,0.25)" }}>Sign up</Link>
          </div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
            Built on <span style={{ color: "rgba(255,255,255,0.5)" }}>Corsair</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

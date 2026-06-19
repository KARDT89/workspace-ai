import type { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "@/components/login-form"

export const metadata: Metadata = {
  title: "Sign in — Corsair Hub",
}

function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Blobs */}
      <div
        className="absolute rounded-full"
        style={{
          width: 600,
          height: 600,
          top: "5%",
          left: "-10%",
          background: "radial-gradient(circle, rgba(99,102,241,0.55) 0%, transparent 70%)",
          filter: "blur(72px)",
          animation: "aurora-1 14s ease-in-out infinite",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 520,
          height: 520,
          top: "30%",
          right: "-5%",
          background: "radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "aurora-2 18s ease-in-out infinite",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 450,
          height: 450,
          bottom: "0%",
          left: "20%",
          background: "radial-gradient(circle, rgba(139,92,246,0.45) 0%, transparent 70%)",
          filter: "blur(64px)",
          animation: "aurora-3 12s ease-in-out infinite",
        }}
      />
      {/* Subtle noise/grain overlay */}
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E\")" }} />
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex" style={{ background: "#070710" }}>

      {/* ── Left: Aurora panel (desktop only) ─────────────────────────────── */}
      <div className="hidden lg:flex w-[55%] relative overflow-hidden flex-col items-center justify-center p-16" style={{ background: "linear-gradient(135deg, #070710 0%, #0c0c1e 100%)" }}>
        <AuroraBackground />

        {/* Content on top of aurora */}
        <div className="relative z-10 max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "#3b82f6", boxShadow: "0 0 20px rgba(59,130,246,0.5)" }}
            >
              <span className="text-white text-sm font-black leading-none select-none">C</span>
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">Corsair Hub</span>
          </div>

          {/* Tagline */}
          <h2
            className="font-bold tracking-tight leading-tight mb-5"
            style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", color: "#f0f0f0" }}
          >
            Email built exactly<br />
            the way you&apos;d<br />
            <span style={{ color: "#60a5fa" }}>build it.</span>
          </h2>
          <p className="text-base leading-relaxed mb-12" style={{ color: "rgba(255,255,255,0.45)" }}>
            Keyboard-first inbox. AI priority scoring. A natural-language
            agent that acts on your behalf — on your infrastructure.
          </p>

          {/* Social proof / stats */}
          <div className="flex items-center gap-8">
            {[["40+", "shortcuts"], ["< 200ms", "load time"], ["0 clicks", "to archive"]].map(([stat, label], i) => (
              <div key={label} className="flex items-center gap-8">
                {i > 0 && <div className="w-px h-6" style={{ background: "rgba(255,255,255,0.1)" }} />}
                <div>
                  <div className="text-sm font-semibold tabular-nums text-white">{stat}</div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Form panel ──────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10" style={{ background: "#080808" }}>
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
              style={{ background: "#3b82f6", boxShadow: "0 0 12px rgba(59,130,246,0.4)" }}
            >
              <span className="text-white text-[10px] font-black leading-none select-none">C</span>
            </div>
            <span className="text-sm font-semibold tracking-tight">Corsair Hub</span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold tracking-tight mb-1.5">Welcome back</h1>
          <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>
            Sign in to your account to continue
          </p>

          <LoginForm />

          <p className="mt-6 text-center text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
            By continuing you agree to our{" "}
            <a href="#" className="underline underline-offset-2 hover:text-foreground transition-colors">Terms</a>
            {" "}and{" "}
            <a href="#" className="underline underline-offset-2 hover:text-foreground transition-colors">Privacy Policy</a>.
          </p>

          <p className="mt-4 text-center text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-blue-400 hover:text-blue-300 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

import type { Metadata } from "next"
import Link from "next/link"
import { SignupForm } from "@/components/signup-form"

export const metadata: Metadata = {
  title: "Create account — Corsair Hub",
}

function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute rounded-full"
        style={{
          width: 580,
          height: 580,
          top: "0%",
          right: "-5%",
          background: "radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "aurora-2 16s ease-in-out infinite",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 500,
          height: 500,
          bottom: "10%",
          left: "-5%",
          background: "radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 70%)",
          filter: "blur(72px)",
          animation: "aurora-1 13s ease-in-out infinite",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 420,
          height: 420,
          top: "40%",
          left: "35%",
          background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)",
          filter: "blur(64px)",
          animation: "aurora-3 20s ease-in-out infinite",
        }}
      />
    </div>
  )
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex" style={{ background: "#070710" }}>

      {/* ── Left: Aurora panel ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex w-[55%] relative overflow-hidden flex-col items-center justify-center p-16" style={{ background: "linear-gradient(135deg, #070710 0%, #0c0c1e 100%)" }}>
        <AuroraBackground />

        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-16">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "#3b82f6", boxShadow: "0 0 20px rgba(59,130,246,0.5)" }}
            >
              <span className="text-white text-sm font-black leading-none select-none">C</span>
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">Corsair Hub</span>
          </div>

          <h2
            className="font-bold tracking-tight leading-tight mb-5"
            style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", color: "#f0f0f0" }}
          >
            Your inbox.<br />
            Your rules.<br />
            <span style={{ color: "#60a5fa" }}>Your infrastructure.</span>
          </h2>
          <p className="text-base leading-relaxed mb-12" style={{ color: "rgba(255,255,255,0.45)" }}>
            Connect Gmail in two minutes and unlock AI-powered priority
            scoring, keyboard navigation, and agent-driven actions.
          </p>

          <div className="space-y-3">
            {[
              "AI priority scoring on every email",
              "40+ keyboard shortcuts out of the box",
              "Natural-language agent for actions",
              "Google Calendar integration",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "rgba(59,130,246,0.25)", border: "1px solid rgba(59,130,246,0.4)" }}
                >
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden>
                    <path d="M1.5 4.5l1.5 1.5L6.5 2.5" stroke="#60a5fa" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{item}</span>
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

          <h1 className="text-2xl font-bold tracking-tight mb-1.5">Create your account</h1>
          <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>
            Get started in two minutes — free forever
          </p>

          <SignupForm />

          <p className="mt-6 text-center text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
            By continuing you agree to our{" "}
            <a href="#" className="underline underline-offset-2 hover:text-foreground transition-colors">Terms</a>
            {" "}and{" "}
            <a href="#" className="underline underline-offset-2 hover:text-foreground transition-colors">Privacy Policy</a>.
          </p>

          <p className="mt-4 text-center text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

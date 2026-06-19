"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, CircleNotch } from "@phosphor-icons/react";
import { MovingBorder } from "@/components/ui/moving-border";
import { BlurFade } from "@/components/ui/blur-fade";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { cn } from "@/lib/utils";

type PluginConnectionState = "connected" | "missing_credentials" | "not_connected";
type LocalState = PluginConnectionState | "connecting";

interface Plugin {
  id: string;
  label: string;
  description: string;
  state: PluginConnectionState;
}

export interface ConnectCardsProps {
  plugins: Plugin[];
}

// ── Icons ──────────────────────────────────────────────────────────────────────

function GoogleGIcon({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function GoogleCalendarIcon({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <rect x="6" y="6" width="36" height="36" rx="4" fill="#fff" />
      <rect x="6" y="6" width="36" height="10" rx="4" fill="#1967D2" />
      <rect x="6" y="12" width="36" height="4" fill="#1967D2" />
      <rect x="6" y="6" width="36" height="36" rx="4" stroke="#E0E0E0" strokeWidth="1.5" fill="none" />
      <text
        x="24"
        y="36"
        textAnchor="middle"
        fill="#1967D2"
        fontSize="16"
        fontWeight="700"
        fontFamily="sans-serif"
      >
        31
      </text>
      <circle cx="16" cy="8" r="2.5" fill="white" />
      <circle cx="32" cy="8" r="2.5" fill="white" />
    </svg>
  );
}

const ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  gmail: GoogleGIcon,
  googlecalendar: GoogleCalendarIcon,
};

// ── Animated checkmark ─────────────────────────────────────────────────────────

function AnimatedCheckmark() {
  return (
    <motion.svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      initial="hidden"
      animate="visible"
      aria-hidden="true"
    >
      <motion.circle
        cx="11"
        cy="11"
        r="10"
        stroke="currentColor"
        strokeWidth="1.5"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: {
            pathLength: 1,
            opacity: 1,
            transition: { duration: 0.4, ease: "easeInOut" },
          },
        }}
      />
      <motion.path
        d="M6.5 11l3.5 3.5 5.5-5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={{
          hidden: { pathLength: 0 },
          visible: {
            pathLength: 1,
            transition: { duration: 0.3, delay: 0.3, ease: "easeInOut" },
          },
        }}
      />
    </motion.svg>
  );
}

// ── Step dots ──────────────────────────────────────────────────────────────────

function StepDots({ currentStep }: { currentStep: 1 | 2 }) {
  return (
    <div className="mb-10 flex items-center justify-center gap-3">
      {[1, 2].map((step) => (
        <motion.div
          key={step}
          className="rounded-full"
          animate={
            step === currentStep
              ? {
                  width: 24,
                  height: 8,
                  backgroundColor: "oklch(0.623 0.214 259.5)",
                  boxShadow: "0 0 12px oklch(0.623 0.214 259.5 / 0.6)",
                }
              : {
                  width: 8,
                  height: 8,
                  backgroundColor: "oklch(0.22 0 0)",
                  boxShadow: "none",
                }
          }
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ── Individual card ────────────────────────────────────────────────────────────

interface CardProps {
  plugin: Plugin;
  localState: LocalState;
  onConnect: (id: string) => void;
}

function IntegrationCard({ plugin, localState, onConnect }: CardProps) {
  const Icon = ICONS[plugin.id] ?? GoogleGIcon;
  const isConnected = localState === "connected";
  const isConnecting = localState === "connecting";

  const cardContent = (
    <div
      className={cn(
        "flex h-full flex-col gap-5 rounded-[11px] p-6 transition-shadow duration-300",
        "bg-card",
        isConnected && "shadow-[0_0_48px_oklch(0.725_0.178_147.2_/_0.12)]",
      )}
    >
      {/* Icon */}
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 p-2 ring-1 ring-white/10">
        <Icon size={36} />
      </div>

      {/* Text */}
      <div className="flex-1 space-y-1.5">
        <p className="text-lg font-semibold tracking-tight">{plugin.label}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{plugin.description}</p>
      </div>

      {/* Status + action */}
      <div className="flex items-center justify-between">
        {isConnected ? (
          <>
            <span className="flex items-center gap-1.5 text-sm font-medium text-[oklch(0.725_0.178_147.2)]">
              <AnimatedCheckmark />
              Connected
            </span>
            <button
              onClick={() => onConnect(plugin.id)}
              className="text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              Reconnect
            </button>
          </>
        ) : isConnecting ? (
          <>
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <CircleNotch size={16} className="animate-spin" />
              Authorizing…
            </span>
          </>
        ) : (
          <ShimmerButton onClick={() => onConnect(plugin.id)} className="ml-auto">
            Connect
          </ShimmerButton>
        )}
      </div>
    </div>
  );

  if (isConnected || isConnecting) {
    return (
      <motion.div
        className={cn(
          "rounded-xl border transition-shadow duration-300 hover:shadow-lg",
          isConnected
            ? "border-[oklch(0.725_0.178_147.2_/_0.3)]"
            : "border-border",
        )}
        whileHover={!isConnecting ? { y: -2 } : undefined}
        transition={{ duration: 0.15 }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
      <MovingBorder duration={3.5}>{cardContent}</MovingBorder>
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ConnectCards({ plugins }: ConnectCardsProps) {
  const router = useRouter();

  const [localStates, setLocalStates] = useState<Record<string, LocalState>>(
    () => Object.fromEntries(plugins.map((p) => [p.id, p.state])),
  );

  const allConnected = plugins.every((p) => localStates[p.id] === "connected");
  const step: 1 | 2 = allConnected ? 2 : 1;

  const handleConnect = (pluginId: string) => {
    setLocalStates((prev) => ({ ...prev, [pluginId]: "connecting" }));
    router.push(`/api/corsair/auth?plugin=${pluginId}`);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      {/* Radial glow behind content */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 40%, oklch(0.623 0.214 259.5 / 0.07), transparent 60%)",
        }}
      />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Step dots */}
        <StepDots currentStep={step} />

        {/* Heading */}
        <BlurFade className="mb-8 space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {allConnected ? "You're all set" : "Connect your accounts"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {allConnected
              ? "Both integrations are active. Continue to the app."
              : "Grant access to get started with Corsair Hub"}
          </p>
        </BlurFade>

        {/* Cards grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {plugins.map((plugin, i) => (
            <BlurFade key={plugin.id} delay={i * 0.08}>
              <IntegrationCard
                plugin={plugin}
                localState={localStates[plugin.id]}
                onConnect={handleConnect}
              />
            </BlurFade>
          ))}
        </div>

        {/* Continue button — appears with BlurFade when all connected */}
        <div className="mt-8 flex justify-center">
          {allConnected ? (
            <BlurFade>
              <button
                onClick={() => router.push("/mail")}
                className={cn(
                  "group flex items-center gap-2 rounded-xl px-6 py-3",
                  "bg-primary text-sm font-medium text-primary-foreground",
                  "shadow-[0_0_24px_oklch(0.623_0.214_259.5_/_0.35)]",
                  "transition-all hover:scale-[1.02] hover:shadow-[0_0_32px_oklch(0.623_0.214_259.5_/_0.5)]",
                  "active:scale-[0.98]",
                )}
              >
                Continue to app
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </button>
            </BlurFade>
          ) : (
            <p className="text-xs text-muted-foreground">
              Connect both services above to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

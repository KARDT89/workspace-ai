import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/betterauth/session";
import { corsair } from "@/server/corsair";
import { CheckCircle, Warning, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

const PLUGINS = [
  { id: "gmail", label: "Gmail", description: "Read, send, and search your email" },
  { id: "googlecalendar", label: "Google Calendar", description: "View and manage your calendar events" },
] as const;

export default async function ConnectPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const status = await corsair.manage.connectionStatus.get({
    tenantId: session.user.id,
  });

  const allConnected = PLUGINS.every(
    (p) => status[p.id] === "connected",
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 px-4">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Connect your accounts
          </h1>
          <p className="text-sm text-muted-foreground">
            Grant access to get started with Corsair Hub
          </p>
        </div>

        <div className="space-y-3">
          {PLUGINS.map((plugin) => {
            const state = status[plugin.id] ?? "not_connected";
            const connected = state === "connected";

            return (
              <div
                key={plugin.id}
                className="flex items-center justify-between rounded-lg border bg-card px-4 py-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{plugin.label}</span>
                    {connected ? (
                      <CheckCircle className="text-green-500" size={16} weight="fill" />
                    ) : state === "missing_credentials" ? (
                      <Warning className="text-amber-500" size={16} weight="fill" />
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {plugin.description}
                  </p>
                </div>
                <Link
                  href={`/api/corsair/auth?plugin=${plugin.id}`}
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                >
                  {connected ? "Reconnect" : "Connect"}
                </Link>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Link
            href="/mail"
            aria-disabled={!allConnected}
            className={`inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              allConnected
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "pointer-events-none bg-muted text-muted-foreground"
            }`}
          >
            Continue to app
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

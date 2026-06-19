import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/betterauth/session";
import { corsair } from "@/server/corsair";
import { ConnectCards } from "@/components/connect/connect-cards";

const PLUGINS = [
  {
    id: "gmail",
    label: "Gmail",
    description: "Read, compose, and search your email directly from Corsair Hub.",
  },
  {
    id: "googlecalendar",
    label: "Google Calendar",
    description: "View and manage your calendar events alongside your inbox.",
  },
] as const;

export default async function ConnectPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const status = await corsair.manage.connectionStatus.get({
    tenantId: session.user.id,
  });

  const plugins = PLUGINS.map((p) => ({
    ...p,
    state: (status[p.id] ?? "not_connected") as
      | "connected"
      | "missing_credentials"
      | "not_connected",
  }));

  return <ConnectCards plugins={plugins} />;
}

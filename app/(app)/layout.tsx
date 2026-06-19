import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/betterauth/session";
import { db } from "@/server/db";
import { corsairAccounts } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { NavRail } from "@/components/layout/nav-rail";
import { StatusBar } from "@/components/layout/status-bar";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const accounts = await db
    .select()
    .from(corsairAccounts)
    .where(eq(corsairAccounts.tenantId, session.user.id));

  if (accounts.length === 0) redirect("/connect");

  const user = {
    name: session.user.name,
    email: session.user.email,
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Main area: nav rail + page content */}
      <div className="flex min-h-0 flex-1">
        {/* Desktop nav rail */}
        <NavRail user={user} className="hidden lg:flex" />

        {/* Page content fills remaining space */}
        <div className="flex min-w-0 flex-1 overflow-hidden">
          {children}
        </div>
      </div>

      {/* VS Code-style status bar — desktop only */}
      <StatusBar className="hidden lg:flex" />

      {/* Bottom tab bar — mobile only */}
      <MobileTabBar className="flex lg:hidden" />
    </div>
  );
}

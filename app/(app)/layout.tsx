import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/betterauth/session";
import { db } from "@/server/db";
import { corsairAccounts } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { AppNav } from "@/components/app-nav";

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

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppNav />
      <div className="flex flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

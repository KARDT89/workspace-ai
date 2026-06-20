import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/betterauth/session";
import { db } from "@/server/db";
import { corsairAccounts } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

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
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar user={user} />
        <SidebarInset className="h-svh min-w-0 overflow-hidden">
          <AppHeader />
          <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

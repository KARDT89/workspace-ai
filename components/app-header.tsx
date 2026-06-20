"use client";

import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

const titles: Record<string, { title: string; description: string }> = {
  "/mail": { title: "Mail", description: "Inbox and conversations" },
  "/calendar": { title: "Calendar", description: "Schedule and events" },
  "/agent": { title: "Agent", description: "Your workspace assistant" },
  "/settings": { title: "Settings", description: "Workspace preferences" },
};

export function AppHeader() {
  const pathname = usePathname();
  const page =
    Object.entries(titles).find(([path]) => pathname.startsWith(path))?.[1] ??
    titles["/mail"];

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4" />
      <div className="min-w-0">
        <h1 className="truncate text-sm font-semibold">{page.title}</h1>
        <p className="hidden truncate text-xs text-muted-foreground sm:block">
          {page.description}
        </p>
      </div>
    </header>
  );
}

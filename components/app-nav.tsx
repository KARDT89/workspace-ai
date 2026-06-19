"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Envelope,
  CalendarBlank,
  Robot,
  GearSix,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/mail", icon: Envelope, label: "Mail" },
  { href: "/calendar", icon: CalendarBlank, label: "Calendar" },
  { href: "/agent", icon: Robot, label: "Agent" },
  { href: "/settings", icon: GearSix, label: "Settings" },
] as const;

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="flex w-16 flex-col items-center gap-1 border-r bg-card py-3">
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            title={label}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
              active && "bg-accent text-blue-500",
            )}
          >
            <Icon size={22} weight={active ? "fill" : "regular"} />
          </Link>
        );
      })}
    </nav>
  );
}

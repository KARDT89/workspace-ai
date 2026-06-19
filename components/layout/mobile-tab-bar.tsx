"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Envelope, CalendarBlank, Robot, GearSix } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/mail", icon: Envelope, label: "Mail" },
  { href: "/calendar", icon: CalendarBlank, label: "Calendar" },
  { href: "/agent", icon: Robot, label: "Agent" },
  { href: "/settings", icon: GearSix, label: "Settings" },
] as const;

export interface MobileTabBarProps {
  unreadCount?: number;
  className?: string;
}

export function MobileTabBar({ unreadCount = 0, className }: MobileTabBarProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex h-12 shrink-0 items-center border-t border-border bg-card",
        "pb-[env(safe-area-inset-bottom)]",
        className,
      )}
    >
      {TABS.map(({ href, icon: Icon, label }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <div className="relative">
              <Icon size={22} weight={active ? "fill" : "regular"} />
              {/* Unread badge on Mail */}
              {label === "Mail" && unreadCount > 0 && (
                <span
                  className={cn(
                    "absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center",
                    "rounded-full bg-amber-500 px-1 text-[10px] font-bold leading-none text-white",
                  )}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>
            {/* Label: shown when active */}
            <span className={cn("text-[10px] leading-none", active ? "opacity-100" : "opacity-0 h-0")}>
              {label}
            </span>
            {/* Active underline indicator */}
            {active && (
              <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-t-full bg-primary" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

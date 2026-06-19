"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Envelope,
  CalendarBlank,
  Robot,
  GearSix,
  SignOut,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/betterauth/auth-client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ModeToggle } from "@/components/mode-toggle";

// ── Constants ──────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: "/mail", icon: Envelope, label: "Mail", shortcut: "g m" },
  { href: "/calendar", icon: CalendarBlank, label: "Calendar", shortcut: "g c" },
  { href: "/agent", icon: Robot, label: "Agent", shortcut: "g a" },
  { href: "/settings", icon: GearSix, label: "Settings", shortcut: "g s" },
] as const;

const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-violet-600",
  "bg-emerald-600",
  "bg-orange-500",
  "bg-rose-600",
  "bg-teal-600",
] as const;

// ── Helpers ────────────────────────────────────────────────────────────────────

function getInitials(name: string | null | undefined, email: string): string {
  if (name && name.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email.slice(0, 2).toUpperCase();
}

function getAvatarColor(email: string): string {
  const hash = [...email].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

// ── User avatar + popover ──────────────────────────────────────────────────────

function UserAvatar({
  name,
  email,
}: {
  name: string | null | undefined;
  email: string;
}) {
  const router = useRouter();
  const initials = getInitials(name, email);
  const colorClass = getAvatarColor(email);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white",
            "ring-2 ring-transparent transition-all hover:ring-primary/40",
            colorClass,
          )}
          aria-label="Account menu"
        >
          {initials}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="end"
        className="w-52 p-2"
        sideOffset={8}
      >
        {/* User info */}
        <div className="px-2 py-1.5 mb-1">
          {name && (
            <p className="text-sm font-medium leading-none">{name}</p>
          )}
          <p className="text-xs text-muted-foreground mt-0.5">{email}</p>
        </div>
        <div className="my-1 h-px bg-border" />
        {/* Actions */}
        <Link
          href="/settings"
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
        >
          <GearSix size={15} />
          Settings
        </Link>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10"
        >
          <SignOut size={15} />
          Sign out
        </button>
      </PopoverContent>
    </Popover>
  );
}

// ── Nav item ───────────────────────────────────────────────────────────────────

function NavItem({
  href,
  icon: Icon,
  label,
  shortcut,
  active,
  badge,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number; weight?: "fill" | "regular"; className?: string }>;
  label: string;
  shortcut: string;
  active: boolean;
  badge?: number;
}) {
  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <div className="relative flex items-center justify-center">
          {/* Left accent bar — animated between items */}
          {active && (
            <motion.div
              layoutId="nav-accent-bar"
              className="absolute -left-3 h-6 w-0.5 rounded-r-full bg-primary"
              transition={{ type: "spring", stiffness: 500, damping: 40 }}
            />
          )}
          <Link
            href={href}
            className={cn(
              "relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-100",
              active
                ? "text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {/* Active background — shared layoutId animates between items */}
            {active && (
              <motion.div
                layoutId="nav-active-bg"
                className="absolute inset-0 rounded-lg bg-primary/15"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <Icon size={21} weight={active ? "fill" : "regular"} className="relative z-10" />
            {/* Unread badge */}
            {badge != null && badge > 0 && (
              <span
                className={cn(
                  "absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center",
                  "rounded-full bg-amber-500 px-1 text-[10px] font-bold leading-none text-white",
                )}
              >
                {badge > 99 ? "99+" : badge}
              </span>
            )}
          </Link>
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8} className="flex items-center gap-2">
        <span>{label}</span>
        <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          {shortcut}
        </kbd>
      </TooltipContent>
    </Tooltip>
  );
}

// ── NavRail ────────────────────────────────────────────────────────────────────

export interface NavRailProps {
  user: { name?: string | null; email: string };
  unreadCount?: number;
  className?: string;
}

export function NavRail({ user, unreadCount = 0, className }: NavRailProps) {
  const pathname = usePathname();

  return (
    <TooltipProvider>
      <nav
        className={cn(
          "flex w-16 shrink-0 flex-col items-center border-r border-border bg-card py-3",
          className,
        )}
      >
        {/* Corsair logo */}
        <Link
          href="/mail"
          className="mb-5 flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ background: "#3b82f6", boxShadow: "0 0 16px rgba(59,130,246,0.4)" }}
          aria-label="Corsair Hub"
        >
          <span className="text-sm font-black leading-none text-white select-none">C</span>
        </Link>

        {/* Nav items */}
        <div className="flex flex-1 flex-col items-center gap-1">
          {NAV_ITEMS.map(({ href, icon, label, shortcut }) => (
            <NavItem
              key={href}
              href={href}
              icon={icon}
              label={label}
              shortcut={shortcut}
              active={pathname.startsWith(href)}
              badge={label === "Mail" ? unreadCount : undefined}
            />
          ))}
        </div>

        {/* Theme toggle + user avatar */}
        <div className="flex flex-col items-center gap-2">
          <ModeToggle />
          <UserAvatar name={user.name} email={user.email} />
        </div>
      </nav>
    </TooltipProvider>
  );
}

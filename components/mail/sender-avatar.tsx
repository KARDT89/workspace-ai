import { cn } from "@/lib/utils";

const PALETTE: [string, string][] = [
  ["#1d4ed8", "#3b82f6"], // blue
  ["#6d28d9", "#8b5cf6"], // violet
  ["#047857", "#10b981"], // emerald
  ["#b45309", "#f59e0b"], // amber/orange
  ["#be185d", "#ec4899"], // rose
  ["#0f766e", "#14b8a6"], // teal
];

function getPalette(seed: string): [string, string] {
  const hash = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0);
  return PALETTE[hash % PALETTE.length];
}

function getInitials(name: string): string {
  const clean = name.trim();
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  // single word or email local-part
  const local = clean.replace(/@.*/, "");
  return local.slice(0, 2).toUpperCase();
}

interface SenderAvatarProps {
  name: string;
  size?: number;
  className?: string;
}

export function SenderAvatar({ name, size = 32, className }: SenderAvatarProps) {
  const [from, to] = getPalette(name || "?");
  const initials = getInitials(name || "?");

  return (
    <div
      aria-hidden="true"
      className={cn("flex shrink-0 items-center justify-center rounded-full text-white", className)}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.34),
        fontWeight: 600,
        letterSpacing: "0.02em",
        background: `linear-gradient(135deg, ${from}, ${to})`,
      }}
    >
      {initials}
    </div>
  );
}

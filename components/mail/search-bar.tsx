"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface SearchFilters {
  from?: string;
  subject?: string;
}

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
}

const CHIPS = [
  { key: "from" as const, label: "From" },
  { key: "subject" as const, label: "Subject" },
];

export function SearchBar({ onSearch }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [activeChips, setActiveChips] = useState<Set<keyof SearchFilters>>(new Set());

  // Global `/` key to focus
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const emit = useCallback(
    (q: string, chips: Set<keyof SearchFilters>) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const filters: SearchFilters = {};
        for (const k of chips) filters[k] = q;
        onSearch(q, filters);
      }, 300);
    },
    [onSearch],
  );

  const handleChange = (q: string) => {
    setValue(q);
    emit(q, activeChips);
  };

  const toggleChip = (key: keyof SearchFilters) => {
    setActiveChips((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      emit(value, next);
      return next;
    });
  };

  const clear = () => {
    setValue("");
    setActiveChips(new Set());
    onSearch("", {});
  };

  const showChips = focused || activeChips.size > 0;

  return (
    <div className="shrink-0 px-3 pt-2 pb-1.5">
      <div
        className={cn(
          "flex h-9 items-center gap-2 rounded-lg border px-3 transition-all duration-150",
          "bg-muted/50",
          focused
            ? "border-primary/50 shadow-[0_0_0_2px_oklch(0.623_0.214_259.5_/_0.12)]"
            : "border-border",
        )}
      >
        <MagnifyingGlass size={14} className="shrink-0 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search mail…"
          className="h-auto flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onMouseDown={(e) => e.preventDefault()}
            onClick={clear}
            className="text-muted-foreground"
          >
            <X size={13} />
          </Button>
        )}
      </div>

      {showChips && (
        <div className="mt-1.5 flex gap-1.5">
          {CHIPS.map(({ key, label }) => (
            <Button
              type="button"
              size="xs"
              variant={activeChips.has(key) ? "secondary" : "outline"}
              key={key}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => toggleChip(key)}
              className={cn("h-6 rounded-full px-2 text-[11px]", activeChips.has(key) && "text-primary")}
            >
              {label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

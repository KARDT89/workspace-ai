"use client";

import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { motion } from "framer-motion";
import { PencilSimple, Mailbox } from "@phosphor-icons/react";
import { ThreadRow } from "./thread-row";
import { SearchBar, type SearchFilters } from "./search-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { InboxMessage } from "@/server/db/queries/gmail";

// ── Tab bar ────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "inbox", label: "Inbox" },
  { id: "sent", label: "Sent" },
  { id: "drafts", label: "Drafts" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function TabBar({
  active,
  onChange,
  unreadCount,
}: {
  active: TabId;
  onChange: (tab: TabId) => void;
  unreadCount: number;
}) {
  return (
    <div className="flex shrink-0 border-b border-border">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "relative flex-1 py-2 text-xs font-medium transition-colors",
            active === tab.id
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {tab.label}
          {tab.id === "inbox" && unreadCount > 0 && (
            <span className="ml-1 rounded-full bg-primary/20 px-1.5 text-[10px] font-semibold text-primary">
              {unreadCount}
            </span>
          )}
          {active === tab.id && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-primary"
              transition={{ type: "spring", stiffness: 500, damping: 40 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}

// ── Skeleton loader ────────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex h-18 items-center gap-2.5 border-b border-border/40 pl-4 pr-3"
        >
          {/* Dot + avatar column */}
          <div className="flex shrink-0 flex-col items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-muted" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          {/* Text column */}
          <div className="flex flex-1 flex-col gap-1.5 overflow-hidden">
            <div className="flex items-baseline gap-2">
              <Skeleton className="h-3 w-28 flex-1" />
              <Skeleton className="h-2.5 w-8 shrink-0" />
            </div>
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-2.5 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────

function EmptyState({
  isSearch,
  query,
  onCompose,
}: {
  isSearch: boolean;
  query: string;
  onCompose: () => void;
}) {
  if (isSearch) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
        <Mailbox size={40} className="text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          No messages matching &ldquo;{query}&rdquo;
        </p>
        <p className="text-xs text-muted-foreground/60">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
      <Mailbox size={40} className="text-muted-foreground/40" />
      <p className="text-sm font-medium text-muted-foreground">All clear.</p>
      <button
        onClick={onCompose}
        className="text-xs text-primary/80 transition-colors hover:text-primary"
      >
        Press <kbd className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">c</kbd> to compose
      </button>
    </div>
  );
}

// ── ThreadList ─────────────────────────────────────────────────────────────────

type Props = {
  selectedThreadId?: string;
  onSelectThread: (threadId: string) => void;
  onCompose: () => void;
};

export function ThreadList({ selectedThreadId, onSelectThread, onCompose }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);
  const backfillFired = useRef(false);
  const qc = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabId>("inbox");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});

  const isSearching =
    searchQuery.trim().length > 0 || Object.keys(searchFilters).length > 0;

  const { data: rawMessages = [], isLoading } = useQuery<InboxMessage[]>({
    queryKey: isSearching ? ["inbox-search", searchQuery, searchFilters] : ["inbox"],
    queryFn: () => {
      if (isSearching) {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set("q", searchQuery.trim());
        if (searchFilters.from) params.set("from", searchFilters.from);
        if (searchFilters.subject) params.set("subject", searchFilters.subject);
        return fetch(`/api/gmail/messages/search?${params}`).then((r) => r.json());
      }
      return fetch("/api/gmail/messages").then((r) => r.json());
    },
    refetchInterval: isSearching ? undefined : 60_000,
  });

  // SSE — server pushes "inbox:updated" when a new email arrives via webhook
  useEffect(() => {
    const es = new EventSource("/api/gmail/events");
    es.onmessage = () => qc.invalidateQueries({ queryKey: ["inbox"] });
    return () => es.close();
  }, [qc]);

  // Backfill priorities for messages that have never been classified
  useEffect(() => {
    if (backfillFired.current || isSearching || !rawMessages.length) return;
    const missing = rawMessages.filter((m) => !m.priority).slice(0, 50);
    if (!missing.length) { backfillFired.current = true; return; }
    backfillFired.current = true;

    Promise.all(
      missing.map((m) =>
        fetch("/api/ai/prioritize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messageEntityId: m.entityId,
            subject: m.subject,
            snippet: m.snippet,
            from: m.from,
          }),
        }).catch(() => null)
      )
    ).then(() => qc.invalidateQueries({ queryKey: ["inbox"] }));
  }, [rawMessages, isSearching, qc]);

  // Client-side tab filter (search results skip tab filtering)
  const displayMessages = useMemo(() => {
    if (isSearching) return rawMessages;
    if (activeTab === "sent") return rawMessages.filter((m) => m.labelIds.includes("SENT"));
    if (activeTab === "drafts") return rawMessages.filter((m) => m.labelIds.includes("DRAFT"));
    return rawMessages;
  }, [rawMessages, activeTab, isSearching]);

  const unreadCount = useMemo(
    () => rawMessages.filter((m) => m.unread).length,
    [rawMessages],
  );

  const handleSearch = useCallback((q: string, filters: SearchFilters) => {
    setSearchQuery(q);
    setSearchFilters(filters);
  }, []);

  // Virtualizer — 72px fixed row height
  const rowVirtualizer = useVirtualizer({
    count: displayMessages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 6,
  });

  return (
    <div className="flex h-full w-80 shrink-0 flex-col border-r border-border">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between px-4 py-2.5">
        <h2 className="text-sm font-semibold">Mail</h2>
        <button
          onClick={onCompose}
          title="Compose (c)"
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <PencilSimple size={16} />
        </button>
      </div>

      {/* Search bar */}
      <SearchBar onSearch={handleSearch} />

      {/* Tab bar */}
      <TabBar
        active={activeTab}
        onChange={(tab) => {
          setActiveTab(tab);
          setSearchQuery("");
          setSearchFilters({});
        }}
        unreadCount={unreadCount}
      />

      {/* Thread list */}
      <div ref={parentRef} className="flex-1 overflow-y-auto">
        {isLoading ? (
          <SkeletonRows />
        ) : displayMessages.length === 0 ? (
          <EmptyState
            isSearch={isSearching}
            query={searchQuery}
            onCompose={onCompose}
          />
        ) : (
          <div
            style={{ height: rowVirtualizer.getTotalSize(), position: "relative" }}
          >
            {rowVirtualizer.getVirtualItems().map((vRow) => {
              const msg = displayMessages[vRow.index];
              return (
                <div
                  key={vRow.key}
                  style={{
                    position: "absolute",
                    top: vRow.start,
                    left: 0,
                    width: "100%",
                    height: vRow.size,
                  }}
                >
                  <ThreadRow
                    message={msg}
                    selected={msg.threadId === selectedThreadId}
                    onClick={() => onSelectThread(msg.threadId)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

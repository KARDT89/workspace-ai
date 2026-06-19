"use client";

import { useQuery } from "@tanstack/react-query";
import { ThreadRow } from "./thread-row";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PencilSimple } from "@phosphor-icons/react";
import type { InboxMessage } from "@/server/db/queries/gmail";

type Props = {
  selectedThreadId?: string;
  onSelectThread: (threadId: string) => void;
  onCompose: () => void;
};

export function ThreadList({ selectedThreadId, onSelectThread, onCompose }: Props) {
  const { data: messages, isLoading } = useQuery<InboxMessage[]>({
    queryKey: ["inbox"],
    queryFn: () => fetch("/api/gmail/messages").then((r) => r.json()),
    refetchInterval: 30_000,
  });

  return (
    <div className="w-80 shrink-0 border-r border-border flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold">Inbox</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onCompose}
          title="Compose (c)"
        >
          <PencilSimple size={16} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex flex-col gap-0">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="px-4 py-3 border-b border-border/50">
                <div className="flex justify-between mb-1">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-10" />
                </div>
                <Skeleton className="h-3.5 w-48 mb-1" />
                <Skeleton className="h-3 w-56" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && (!messages || messages.length === 0) && (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm gap-2">
            <p>All clear.</p>
            <button
              onClick={onCompose}
              className="text-primary hover:underline text-xs"
            >
              Press c to compose
            </button>
          </div>
        )}

        {messages?.map((msg) => (
          <ThreadRow
            key={msg.entityId}
            message={msg}
            selected={msg.threadId === selectedThreadId}
            onClick={() => onSelectThread(msg.threadId)}
          />
        ))}
      </div>
    </div>
  );
}

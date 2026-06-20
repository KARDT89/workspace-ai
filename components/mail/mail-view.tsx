"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ThreadList } from "./thread-list";
import { ThreadDetail } from "./thread-detail";
import { ComposeWindow } from "./compose-window";

type ReplyContext = {
  to: string[];
  subject: string;
  threadId: string;
  replyToMessageId: string;
};

type Props = {
  initialThreadId?: string;
  initialFolder: "inbox" | "sent" | "drafts";
  userEmail: string;
};

export function MailView({ initialThreadId, initialFolder, userEmail }: Props) {
  const router = useRouter();
  const [composeOpen, setComposeOpen] = useState(false);
  const [replyContext, setReplyContext] = useState<ReplyContext | undefined>();
  const [selectedThreadId, setSelectedThreadId] = useState(initialThreadId);

  // Sync with URL
  useEffect(() => {
    setSelectedThreadId(initialThreadId);
  }, [initialThreadId]);

  const selectThread = useCallback(
    (threadId: string) => {
      setSelectedThreadId(threadId);
      const params = new URLSearchParams({
        folder: initialFolder,
        thread: threadId,
      });
      router.push(`/mail?${params}`, { scroll: false });
    },
    [initialFolder, router]
  );

  const openCompose = useCallback(() => {
    setReplyContext(undefined);
    setComposeOpen(true);
  }, []);

  const openReply = useCallback((ctx: ReplyContext) => {
    setReplyContext(ctx);
    setComposeOpen(true);
  }, []);

  const closeCompose = useCallback(() => {
    setComposeOpen(false);
    setReplyContext(undefined);
  }, []);

  // Global 'c' key to compose
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "c" && !e.metaKey && !e.ctrlKey) {
        openCompose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openCompose]);

  return (
    <div className="relative flex min-w-0 flex-1 overflow-hidden bg-muted/20 p-2 md:p-3">
      <div className="flex min-w-0 flex-1 overflow-hidden rounded-xl border bg-background shadow-sm">
      <ThreadList
        activeFolder={initialFolder}
        selectedThreadId={selectedThreadId}
        onSelectThread={selectThread}
        onCompose={openCompose}
      />

      <ThreadDetail
        threadId={selectedThreadId}
        userEmail={userEmail}
        onReply={openReply}
      />
      </div>

      {composeOpen && (
        <ComposeWindow
          userEmail={userEmail}
          replyContext={replyContext}
          onClose={closeCompose}
        />
      )}
    </div>
  );
}

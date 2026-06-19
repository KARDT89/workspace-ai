"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { parseEmailAddress } from "@/server/lib/email-encoding";
import { ArrowBendUpLeft, ArrowBendUpRight, ArrowBendDoubleUpLeft } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { Thread, ThreadMessage } from "@/server/services/gmail";

type Props = {
  threadId?: string;
  userEmail: string;
  onReply?: (opts: { to: string[]; subject: string; threadId: string; replyToMessageId: string }) => void;
};

function MessageHeader({ msg }: { msg: ThreadMessage }) {
  const [expanded, setExpanded] = useState(false);
  const sender = parseEmailAddress(msg.from);

  return (
    <div className="px-6 py-3 border-b border-border/50">
      <button
        type="button"
        className="w-full text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/20 text-primary text-xs font-semibold flex items-center justify-center flex-shrink-0">
              {(sender.name || sender.email).charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{sender.name || sender.email}</p>
              <p className="text-xs text-muted-foreground">{sender.email}</p>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">{msg.date}</span>
        </div>
      </button>

      {expanded && (
        <div className="mt-2 ml-9 text-xs text-muted-foreground space-y-0.5">
          {msg.to && <p><span className="text-foreground/60">To:</span> {msg.to}</p>}
          {msg.cc && <p><span className="text-foreground/60">Cc:</span> {msg.cc}</p>}
        </div>
      )}
    </div>
  );
}

function MessageBody({ msg }: { msg: ThreadMessage }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current || !msg.isHtml) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head><style>
      body { font-family: system-ui, sans-serif; font-size: 14px; color: #e2e8f0; background: transparent; margin: 0; padding: 0; }
      a { color: #818cf8; }
      img { max-width: 100%; }
    </style></head><body>${msg.body}</body></html>`);
    doc.close();

    const resize = () => {
      if (iframeRef.current && doc.body) {
        iframeRef.current.style.height = doc.body.scrollHeight + "px";
      }
    };
    setTimeout(resize, 100);
  }, [msg.body, msg.isHtml]);

  if (msg.isHtml) {
    return (
      <iframe
        ref={iframeRef}
        className="w-full border-0 min-h-[100px]"
        sandbox="allow-same-origin"
        title="Email body"
      />
    );
  }

  return (
    <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
      {msg.body}
    </pre>
  );
}

export function ThreadDetail({ threadId, userEmail, onReply }: Props) {
  const queryClient = useQueryClient();

  const { data: thread, isLoading } = useQuery<Thread>({
    queryKey: ["thread", threadId],
    queryFn: () =>
      fetch(`/api/gmail/messages/${threadId}`).then((r) => r.json()),
    enabled: !!threadId,
  });

  const { mutate: markAsRead } = useMutation({
    mutationFn: (messageId: string) =>
      fetch(`/api/gmail/messages/${messageId}/read`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
    },
  });

  const latestMessage = thread?.messages.at(-1);

  useEffect(() => {
    if (!thread) return;
    const unread = thread.messages.find((m) => m.unread);
    if (unread) markAsRead(unread.id);
  }, [thread, markAsRead]);

  if (!threadId) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
        Select a message to read
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <Skeleton className="h-5 w-96 mb-2" />
          <Skeleton className="h-3.5 w-48" />
        </div>
        <div className="flex-1 p-6 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
    );
  }

  if (!thread) return null;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Subject header */}
      <div className="px-6 py-4 border-b border-border flex-shrink-0">
        <h1 className="text-base font-semibold">{thread.messages[0]?.subject || "(no subject)"}</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {thread.messages.map((msg, i) => {
          const isCollapsed = i < thread.messages.length - 1;
          return (
            <div key={msg.id} className={cn("border-b border-border/50", isCollapsed && "opacity-60")}>
              <MessageHeader msg={msg} />
              {!isCollapsed && (
                <div className="px-6 py-4">
                  <MessageBody msg={msg} />
                </div>
              )}
              {isCollapsed && (
                <div className="px-6 py-2">
                  <p className="text-xs text-muted-foreground truncate">{msg.body.slice(0, 120)}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Reply toolbar */}
      {latestMessage && (
        <div className="flex-shrink-0 border-t border-border px-6 py-3 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() =>
              onReply?.({
                to: [latestMessage.from],
                subject: `Re: ${latestMessage.subject}`,
                threadId: thread.id,
                replyToMessageId: latestMessage.id,
              })
            }
          >
            <ArrowBendUpLeft size={14} />
            Reply
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() =>
              onReply?.({
                to: [latestMessage.from, ...(latestMessage.to ? [latestMessage.to] : [])].filter(
                  (e) => e !== userEmail
                ),
                subject: `Re: ${latestMessage.subject}`,
                threadId: thread.id,
                replyToMessageId: latestMessage.id,
              })
            }
          >
            <ArrowBendDoubleUpLeft size={14} />
            Reply All
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" disabled>
            <ArrowBendUpRight size={14} />
            Forward
          </Button>
        </div>
      )}
    </div>
  );
}

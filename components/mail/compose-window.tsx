"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Minus, ArrowsOutSimple } from "@phosphor-icons/react";
import { toast } from "sonner";

type ReplyContext = {
  to: string[];
  subject: string;
  threadId: string;
  replyToMessageId: string;
};

type Props = {
  userEmail: string;
  replyContext?: ReplyContext;
  onClose: () => void;
};

type DraftState = {
  to: string;
  subject: string;
  body: string;
};

export function ComposeWindow({ userEmail, replyContext, onClose }: Props) {
  const queryClient = useQueryClient();
  const [minimized, setMinimized] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const [draft, setDraft] = useState<DraftState>({
    to: replyContext?.to.join(", ") ?? "",
    subject: replyContext?.subject ?? "",
    body: "",
  });

  const isDirty = draft.to || draft.subject || draft.body;

  const { mutate: sendMail, isPending: sending } = useMutation({
    mutationFn: () =>
      fetch("/api/gmail/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: draft.to.split(",").map((s) => s.trim()).filter(Boolean),
          subject: draft.subject,
          body: draft.body,
          ...(replyContext
            ? {
                threadId: replyContext.threadId,
                replyToMessageId: replyContext.replyToMessageId,
              }
            : {}),
        }),
      }).then((r) => {
        if (!r.ok) throw new Error("Failed to send");
        return r.json();
      }),
    onSuccess: () => {
      toast.success("Message sent");
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      onClose();
    },
    onError: () => {
      toast.error("Failed to send — please try again");
    },
  });

  const { mutate: saveDraft } = useMutation({
    mutationFn: () =>
      fetch("/api/gmail/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: draft.to.split(",").map((s) => s.trim()).filter(Boolean),
          subject: draft.subject,
          body: draft.body,
          ...(replyContext ? { threadId: replyContext.threadId } : {}),
        }),
      }).then((r) => r.json()),
    onSuccess: () => {
      toast.success("Draft saved");
      onClose();
    },
  });

  const handleClose = useCallback(() => {
    if (isDirty) {
      const confirmed = window.confirm("Save as draft?");
      if (confirmed) {
        saveDraft();
        return;
      }
    }
    onClose();
  }, [isDirty, saveDraft, onClose]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        sendMail();
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        saveDraft();
      }
      if (e.key === "Escape" && !minimized) {
        e.preventDefault();
        handleClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sendMail, saveDraft, handleClose, minimized]);

  return (
    <div
      className={cn(
        "fixed bottom-0 right-6 z-50 bg-background border border-border rounded-t-xl shadow-2xl flex flex-col",
        fullscreen
          ? "inset-4 rounded-xl"
          : minimized
          ? "w-80 h-10"
          : "w-[420px] h-[480px]"
      )}
    >
      {/* Titlebar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/40 rounded-t-xl flex-shrink-0">
        <span className="text-sm font-medium truncate">
          {draft.subject || "New Message"}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMinimized((v) => !v)}
            className="p-1 rounded hover:bg-accent transition-colors"
          >
            <Minus size={13} />
          </button>
          <button
            onClick={() => setFullscreen((v) => !v)}
            className="p-1 rounded hover:bg-accent transition-colors"
          >
            <ArrowsOutSimple size={13} />
          </button>
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-accent transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Fields */}
          <div className="flex flex-col border-b border-border/50 flex-shrink-0">
            <div className="flex items-center border-b border-border/30 px-4">
              <span className="text-xs text-muted-foreground w-8 flex-shrink-0">To</span>
              <Input
                className="border-0 shadow-none focus-visible:ring-0 text-sm h-9 px-2"
                placeholder="recipients@example.com"
                value={draft.to}
                onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))}
              />
            </div>
            <div className="flex items-center px-4">
              <span className="text-xs text-muted-foreground w-8 flex-shrink-0">Sub</span>
              <Input
                className="border-0 shadow-none focus-visible:ring-0 text-sm h-9 px-2"
                placeholder="Subject"
                value={draft.subject}
                onChange={(e) => setDraft((d) => ({ ...d, subject: e.target.value }))}
              />
            </div>
          </div>

          {/* Body */}
          <Textarea
            ref={bodyRef}
            className="flex-1 resize-none border-0 shadow-none focus-visible:ring-0 text-sm rounded-none px-4 py-3"
            placeholder="Write your message here…"
            value={draft.body}
            onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
          />

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-border flex-shrink-0">
            <span className="text-[11px] text-muted-foreground">
              {userEmail}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7"
                onClick={() => saveDraft()}
                disabled={sending}
              >
                Save draft
              </Button>
              <Button
                size="sm"
                className="text-xs h-7 gap-1"
                onClick={() => sendMail()}
                disabled={sending || !draft.to}
              >
                Send
                <span className="text-[10px] text-primary-foreground/60 ml-0.5">⌘↵</span>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

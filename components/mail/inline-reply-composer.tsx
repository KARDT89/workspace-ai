"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PaperPlaneTilt, X } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Props = {
  to: string[];
  subject: string;
  threadId: string;
  replyToMessageId: string;
  onClose: () => void;
};

export function InlineReplyComposer({
  to,
  subject,
  threadId,
  replyToMessageId,
  onClose,
}: Props) {
  const queryClient = useQueryClient();
  const [recipients, setRecipients] = useState(to.join(", "));
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Write a reply..." }),
    ],
    editorProps: {
      attributes: {
        class:
          "min-h-32 px-4 py-3 text-sm leading-relaxed outline-none [&_p.is-editor-empty:first-child::before]:pointer-events-none [&_p.is-editor-empty:first-child::before]:float-left [&_p.is-editor-empty:first-child::before]:h-0 [&_p.is-editor-empty:first-child::before]:text-muted-foreground [&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
      },
    },
    immediatelyRender: false,
    autofocus: "end",
  });

  const { mutate: send, isPending } = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/gmail/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: recipients.split(",").map((value) => value.trim()).filter(Boolean),
          subject,
          body: editor?.getHTML() ?? "",
          threadId,
          replyToMessageId,
        }),
      });
      if (!response.ok) throw new Error("Failed to send reply");
      return response.json();
    },
    onSuccess: () => {
      toast.success("Reply sent");
      queryClient.invalidateQueries({ queryKey: ["thread", threadId] });
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      onClose();
    },
    onError: () => toast.error("Failed to send reply"),
  });

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        if (!isPending && recipients.trim() && !editor?.isEmpty) send();
      }
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editor, isPending, onClose, recipients, send]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="mx-6 mb-5 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2">
        <label className="flex min-w-0 flex-1 items-center gap-2 text-xs text-muted-foreground">
          To
          <input
            value={recipients}
            onChange={(event) => setRecipients(event.target.value)}
            placeholder="recipient@example.com"
            className="h-7 min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground/60"
          />
        </label>
        <button
          type="button"
          aria-label="Close reply"
          onClick={onClose}
          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X size={14} />
        </button>
      </div>
      <EditorContent editor={editor} />
      <div className="flex items-center justify-end gap-3 border-t border-border px-4 py-2.5">
        <span className="text-[10px] text-muted-foreground">⌘ Enter</span>
        <Button
          size="sm"
          className="h-8 gap-1.5"
          disabled={isPending || !recipients.trim() || !editor || editor.isEmpty}
          onClick={() => send()}
        >
          <PaperPlaneTilt size={14} weight="fill" />
          {isPending ? "Sending..." : "Send"}
        </Button>
      </div>
    </motion.div>
  );
}

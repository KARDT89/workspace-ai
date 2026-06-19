"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  defaultDate: Date;
}

export function CreateEventModal({ open, onClose, defaultDate }: Props) {
  const qc = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    date: defaultDate.toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "10:00",
    attendees: "",
    description: "",
    location: "",
    sendInvite: true,
  });

  function set(key: string, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);

    const attendees = form.attendees
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/calendar/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          start: `${form.date}T${form.startTime}:00`,
          end: `${form.date}T${form.endTime}:00`,
          attendees,
          description: form.description || undefined,
          location: form.location || undefined,
          sendInvite: form.sendInvite,
        }),
      });
      if (!res.ok) throw new Error(await res.text());

      toast.success(
        form.sendInvite && attendees.length ? "Event created — invites sent" : "Event created"
      );
      qc.invalidateQueries({ queryKey: ["calendar-events"] });
      onClose();
      setForm((f) => ({ ...f, title: "", attendees: "", description: "", location: "" }));
    } catch {
      toast.error("Failed to create event");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              autoFocus
              placeholder="Event title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Start</Label>
              <Input
                type="time"
                value={form.startTime}
                onChange={(e) => set("startTime", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>End</Label>
              <Input
                type="time"
                value={form.endTime}
                onChange={(e) => set("endTime", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Attendees</Label>
            <Input
              placeholder="email@example.com, other@example.com"
              value={form.attendees}
              onChange={(e) => set("attendees", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Location</Label>
            <Input
              placeholder="Office, Zoom link, etc."
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              placeholder="Add notes..."
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                id="send-invite"
                checked={form.sendInvite}
                onCheckedChange={(v) => set("sendInvite", v)}
              />
              <Label htmlFor="send-invite" className="font-normal">
                Notify attendees
              </Label>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

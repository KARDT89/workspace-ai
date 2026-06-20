import {
  ArrowUp,
  Bot,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Inbox,
  Mail,
  MessageSquareText,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const promptExamples = [
  {
    icon: Inbox,
    title: "Summarize my inbox",
    prompt: "Catch me up on important unread messages.",
  },
  {
    icon: CalendarDays,
    title: "Plan my day",
    prompt: "What does my calendar look like tomorrow?",
  },
  {
    icon: Search,
    title: "Find a conversation",
    prompt: "Find the latest email from Sarah about launch.",
  },
  {
    icon: Mail,
    title: "Draft a reply",
    prompt: "Draft a concise follow-up to my last meeting.",
  },
] as const;

function ConversationHistory() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r bg-muted/20 lg:flex">
      <div className="p-3">
        <Button className="w-full justify-start gap-2" disabled>
          <Plus />
          New conversation
        </Button>
      </div>
      <Separator />
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mb-3 flex size-10 items-center justify-center rounded-xl border bg-background shadow-sm">
          <MessageSquareText className="size-4 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">No conversations yet</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Your recent conversations will appear here.
        </p>
      </div>
      <div className="border-t p-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock3 className="size-3.5" />
          History will sync automatically
        </div>
      </div>
    </aside>
  );
}

function WelcomeState() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-5 py-10 text-center md:px-8">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl" />
        <div className="relative flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <Bot className="size-7" />
        </div>
        <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full border-2 border-background bg-background text-primary">
          <Sparkles className="size-3" />
        </span>
      </div>

      <Badge variant="secondary" className="mb-3 gap-1.5 rounded-full">
        <Sparkles />
        Corsair Agent
      </Badge>
      <h2 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
        What can I help you get done?
      </h2>
      <p className="mt-3 max-w-xl text-pretty text-sm leading-6 text-muted-foreground">
        Ask questions about your inbox and schedule. When actions are enabled,
        the agent will help draft messages and coordinate calendar events too.
      </p>

      <div className="mt-8 grid w-full gap-3 text-left sm:grid-cols-2">
        {promptExamples.map(({ icon: Icon, title, prompt }) => (
          <Card key={title} className="bg-card/70 shadow-none">
            <CardContent className="flex items-start gap-3 p-4">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">{title}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {prompt}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AgentComposer() {
  return (
    <div className="shrink-0 border-t bg-background/95 px-4 py-4 backdrop-blur md:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="relative rounded-xl border bg-muted/20 p-2 shadow-sm">
          <Textarea
            aria-label="Message the agent"
            disabled
            placeholder="Ask about your mail or calendar..."
            className="min-h-20 resize-none border-0 bg-transparent pb-9 shadow-none focus-visible:ring-0"
          />
          <div className="absolute inset-x-3 bottom-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              Agent tools are coming soon
            </div>
            <Button size="icon-sm" disabled aria-label="Send message">
              <ArrowUp />
            </Button>
          </div>
        </div>
        <div className="mt-2 flex items-start justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
          <span>
            Reading can run directly. Sending email or changing your calendar
            will always require approval.
          </span>
        </div>
      </div>
    </div>
  );
}

export function AgentWorkspace() {
  return (
    <div className="flex min-w-0 flex-1 overflow-hidden bg-muted/20 p-2 md:p-3">
      <div className="flex min-w-0 flex-1 overflow-hidden rounded-xl border bg-background shadow-sm">
        <ConversationHistory />
        <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <WelcomeState />
          <AgentComposer />
        </section>
      </div>
    </div>
  );
}

import { db } from "@/server/db";
import { emailPriorities } from "@/server/db/schema";

export type Priority = "high" | "medium" | "low";

export type ClassifyInput = {
  messageEntityId: string;
  subject: string;
  snippet: string;
  from: string;
};

const MODEL =
  process.env.OPENROUTER_CLASSIFIER_MODEL ?? "google/gemini-flash-1.5-8b";

export async function classifyEmailPriority(
  userId: string,
  input: ClassifyInput
): Promise<Priority> {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: buildPrompt(input) }],
        max_tokens: 10,
        temperature: 0,
      }),
    });

    if (!res.ok) throw new Error(`OpenRouter ${res.status}`);

    const data = await res.json();
    const text: string =
      data.choices?.[0]?.message?.content?.toLowerCase().trim() ?? "";
    const priority: Priority =
      (["high", "medium", "low"] as const).find((p) => text.startsWith(p)) ??
      "medium";

    await db
      .insert(emailPriorities)
      .values({
        id: crypto.randomUUID(),
        userId,
        messageEntityId: input.messageEntityId,
        priority,
        createdAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [emailPriorities.userId, emailPriorities.messageEntityId],
        set: { priority },
      });

    return priority;
  } catch {
    return "medium";
  }
}

function buildPrompt(input: ClassifyInput): string {
  return `Classify this email's priority. Reply with exactly one word: high, medium, or low.

From: ${input.from}
Subject: ${input.subject}
Preview: ${input.snippet}

Rules:
- high: urgent action needed, deadline-sensitive, key contact, requires immediate response
- low: newsletter, promotional, automated notification, receipt, FYI with no action needed
- medium: everything else

Priority:`;
}

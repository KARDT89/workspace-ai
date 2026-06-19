import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const emailPriorities = pgTable(
  "email_priorities",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    messageEntityId: text("message_entity_id").notNull(),
    priority: text("priority").notNull(), // 'high' | 'medium' | 'low'
    reasoning: text("reasoning"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("email_priorities_user_message_idx").on(
      t.userId,
      t.messageEntityId,
    ),
  ],
);

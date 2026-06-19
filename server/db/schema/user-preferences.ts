import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const userPreferences = pgTable("user_preferences", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  uiConfig: jsonb("ui_config").default({}).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

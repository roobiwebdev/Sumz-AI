import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

/**
 * SOURCE OF TRUTH KEYWORDS: summary, summaries, history, saved articles, article url, SummaryRow
 * WHAT:  One saved article summary, owned by a user.
 * WHY:   History lives in Postgres (not localStorage) so it follows the user across devices,
 *        and counting rows per day gives the usage cap for free.
 * WHERE: src/server/summaries.ts.
 */
export const summary = pgTable(
  "summary",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    title: text("title"),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("summary_user_created_idx").on(t.userId, t.createdAt)],
);

export type SummaryRow = typeof summary.$inferSelect;

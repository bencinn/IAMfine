import { integer, pgTable, timestamp } from "drizzle-orm/pg-core";

export const authz = pgTable("authz", {
  id: integer().primaryKey().generatedAlwaysAsIdentity({ startWith: 1000 }),
  timestamp: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
});

import { integer, pgTable, timestamp, uuid, text, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid().defaultRandom().primaryKey(),
  username: text().notNull().unique(),
  password_hash: text().notNull(),
  is_admin: boolean().default(false),
});

export const sesh = pgTable("sesh", {
  id: uuid().defaultRandom().primaryKey(),
  userid: uuid()
    .notNull()
    .references(() => users.id),
});

// allowing users to have multiple identity + allow shadowing users.
export const users_ident = pgTable("uiden", {
  id: uuid().defaultRandom().primaryKey(),
  email: text().notNull(),
  client_id: text().array(),
  owner: uuid()
    .notNull()
    .references(() => users.id),
});

// authorization per app
export const authz = pgTable("authz", {
  id: integer().primaryKey().generatedAlwaysAsIdentity({ startWith: 1000 }),
  timestamp: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
  ident_id: uuid()
    .notNull()
    .references(() => users_ident.id),
  shadower_id: uuid().references(() => users_ident.id), // null if not shadowing
});

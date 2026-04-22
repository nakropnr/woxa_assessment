import {
  pgTable,
  uuid,
  text,
  pgEnum,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";

export const brokerTypeEnum = pgEnum("brokerType", [
  "cfd",
  "bond",
  "stock",
  "crypto",
]);

export const brokers = pgTable("Broker", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  logoUrl: text("logo_url"),
  website: varchar("website", { length: 500 }),
  brokerType: brokerTypeEnum("broker_type").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type NewBroker = typeof brokers.$inferInsert;

import { and, eq, ilike, SQL } from "drizzle-orm";
import { db } from "../db/index.js";
import { brokers, type NewBroker } from "../db/schema.js";
import type { BrokerService } from "../api/broker.js";

export const brokerService: BrokerService = {
  async createBroker(payload: NewBroker) {
    const [inserted] = await db.insert(brokers).values(payload).returning();
    return inserted;
  },

  async listBrokers({ search, type }) {
    const conditions: SQL[] = [];

    if (search) {
      conditions.push(ilike(brokers.name, `%${search}%`));
    }

    if (type) {
      conditions.push(eq(brokers.brokerType, type));
    }

    return conditions.length > 0
      ? db.select().from(brokers).where(and(...conditions))
      : db.select().from(brokers);
  },

  async getBrokerBySlug(slug: string) {
    const [row] = await db
      .select()
      .from(brokers)
      .where(eq(brokers.slug, slug))
      .limit(1);

    return row;
  },
};

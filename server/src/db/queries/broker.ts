import { db } from "../index.js";
import { NewBroker, brokers } from "../schema.js";

export async function createBroker(broker: NewBroker) {
  const [result] = await db
    .insert(brokers)
    .values(broker)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function deleteBroker() {
  const result = await db.delete(brokers);
  return result;
}

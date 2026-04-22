import { db } from "./index.js";
import { brokers, type NewBroker } from "./schema.js";

const seedBrokers: NewBroker[] = [
  {
    name: "Sterling Capital Markets",
    slug: "sterling-capital-markets",
    description:
      "Multi-asset institutional broker focused on prime liquidity access and execution infrastructure for professional trading desks.",
    logoUrl:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80",
    website: "https://sterling-capital.example.com",
    brokerType: "cfd",
  },
  {
    name: "NorthBridge Securities",
    slug: "northbridge-securities",
    description:
      "Agency-style stock brokerage providing low-latency market access, analytics, and execution support for equity mandates.",
    logoUrl:
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=1200&q=80",
    website: "https://northbridge-securities.example.com",
    brokerType: "stock",
  },
  {
    name: "Aurelius Bond Partners",
    slug: "aurelius-bond-partners",
    description:
      "Fixed-income broker serving institutions with curated bond inventory, pricing intelligence, and execution support.",
    logoUrl:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80",
    website: "https://aurelius-bond.example.com",
    brokerType: "bond",
  },
  {
    name: "Vertex Digital Assets",
    slug: "vertex-digital-assets",
    description:
      "Institutional crypto brokerage with custody-aligned onboarding, OTC support, and digital asset execution services.",
    logoUrl:
      "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=1200&q=80",
    website: "https://vertex-digital.example.com",
    brokerType: "crypto",
  },
];

async function main() {
  const inserted = await db
    .insert(brokers)
    .values(seedBrokers)
    .onConflictDoNothing({ target: brokers.slug })
    .returning({ slug: brokers.slug });

  console.log(
    `Seed complete. Inserted ${inserted.length} broker(s), skipped ${
      seedBrokers.length - inserted.length
    }.`,
  );
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    process.exit();
  });

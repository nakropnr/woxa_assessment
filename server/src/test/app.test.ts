import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import request from "supertest";
import { createApp } from "../app.js";
import type { BrokerRecord, BrokerService } from "../api/broker.js";
import type { NewBroker } from "../db/schema.js";

function makeBroker(overrides: Partial<BrokerRecord> = {}): BrokerRecord {
  return {
    id: "broker-1",
    name: "Alpha Markets",
    slug: "alpha-markets",
    description: "Institutional liquidity provider",
    logoUrl: "https://example.com/logo.png",
    website: "https://example.com",
    brokerType: "cfd",
    created_at: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

function createStubBrokerService(): BrokerService {
  return {
    async createBroker(payload: NewBroker) {
      return makeBroker({
        name: payload.name,
        slug: payload.slug,
        description: payload.description ?? null,
        logoUrl: payload.logoUrl ?? null,
        website: payload.website ?? null,
        brokerType: payload.brokerType,
      });
    },
    async listBrokers() {
      return [makeBroker()];
    },
    async getBrokerBySlug(slug: string) {
      return slug === "alpha-markets" ? makeBroker() : undefined;
    },
  };
}

test("GET /health returns ok payload", async () => {
  const app = createApp({ brokerService: createStubBrokerService() });
  const response = await request(createServer(app)).get("/health");

  assert.equal(response.status, 200);
  assert.equal(response.body.status, "ok");
  assert.ok(response.body.timestamp);
});

test("GET /api/brokers returns serialized broker list", async () => {
  const app = createApp({ brokerService: createStubBrokerService() });
  const response = await request(createServer(app)).get("/api/brokers");

  assert.equal(response.status, 200);
  assert.equal(response.body.count, 1);
  assert.equal(response.body.data[0].logo_url, "https://example.com/logo.png");
  assert.equal(response.body.data[0].broker_type, "cfd");
  assert.equal(response.body.data[0].created_at, "2026-01-01T00:00:00.000Z");
});

test("GET /api/brokers/:slug returns 404 for missing broker", async () => {
  const app = createApp({ brokerService: createStubBrokerService() });
  const response = await request(createServer(app)).get(
    "/api/brokers/missing-broker",
  );

  assert.equal(response.status, 404);
  assert.equal(response.body.success, false);
  assert.equal(response.body.message, 'Broker "missing-broker" not found');
});

test("GET /api/brokers validates query params centrally", async () => {
  const app = createApp({ brokerService: createStubBrokerService() });
  const response = await request(createServer(app)).get(
    "/api/brokers?type=forex",
  );

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.equal(response.body.message, "Validation failed");
  assert.equal(response.body.errors[0].field, "type");
});

test("POST /api/brokers returns conflict for duplicate slug", async () => {
  const duplicateService: BrokerService = {
    ...createStubBrokerService(),
    async createBroker() {
      const error = new Error("duplicate key");
      Object.assign(error, { code: "23505" });
      throw error;
    },
  };

  const app = createApp({ brokerService: duplicateService });
  const response = await request(createServer(app)).post("/api/brokers").send({
    name: "Alpha Markets",
    slug: "alpha-markets",
    description: "Institutional liquidity provider",
    logo_url: "https://example.com/logo.png",
    website: "https://example.com",
    broker_type: "cfd",
  });

  assert.equal(response.status, 409);
  assert.equal(response.body.success, false);
  assert.equal(response.body.errors[0].field, "slug");
});

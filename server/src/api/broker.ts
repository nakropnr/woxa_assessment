import type { RequestHandler } from "express";
import type { NewBroker } from "../db/schema.js";
import type { CreateBrokerInput } from "./validate.js";
import { ConflictError, NotFoundError } from "./middleware.js";

type BrokerType = "cfd" | "bond" | "stock" | "crypto";

export type BrokerRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  website: string | null;
  brokerType: BrokerType;
  created_at: Date | string;
};

export interface BrokerService {
  createBroker(payload: NewBroker): Promise<BrokerRecord>;
  listBrokers(filters: {
    search?: string;
    type?: BrokerType;
  }): Promise<BrokerRecord[]>;
  getBrokerBySlug(slug: string): Promise<BrokerRecord | undefined>;
}

function toISOString(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

export function serializeBroker(row: BrokerRecord) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    logo_url: row.logoUrl,
    website: row.website,
    broker_type: row.brokerType,
    created_at: toISOString(row.created_at),
  };
}

export function createBrokerHandlers(service: BrokerService): {
  handlerCreateBroker: RequestHandler;
  handlerListBrokers: RequestHandler;
  handlerGetBroker: RequestHandler;
} {
  const handlerCreateBroker: RequestHandler = async (req, res) => {
    const input = req.validatedBody as CreateBrokerInput;
    const payload: NewBroker = {
      name: input.name,
      slug: input.slug,
      description: input.description,
      logoUrl: input.logo_url || null,
      website: input.website || null,
      brokerType: input.broker_type,
    };

    try {
      const inserted = await service.createBroker(payload);
      res.status(201).json({ success: true, data: serializeBroker(inserted) });
    } catch (err) {
      if (err instanceof Error && "code" in err && err.code === "23505") {
        throw new ConflictError(`Slug "${input.slug}" is already taken`, [
          { field: "slug", message: `Slug "${input.slug}" is already taken` },
        ]);
      }
      throw err;
    }
  };

  const handlerListBrokers: RequestHandler = async (req, res) => {
    const { search, type } = (req.validatedQuery ?? req.query) as {
      search?: string;
      type?: BrokerType;
    };

    const rows = await service.listBrokers({ search, type });

    res.json({
      success: true,
      count: rows.length,
      data: rows.map(serializeBroker),
    });
  };

  const handlerGetBroker: RequestHandler = async (req, res) => {
    const { slug } = (req.validatedParams ?? req.params) as { slug: string };
    const row = await service.getBrokerBySlug(slug);

    if (!row) {
      throw new NotFoundError(`Broker "${slug}" not found`);
    }

    res.json({ success: true, data: serializeBroker(row) });
  };

  return {
    handlerCreateBroker,
    handlerListBrokers,
    handlerGetBroker,
  };
}

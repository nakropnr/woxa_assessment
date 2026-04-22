import type { Broker, ApiResponse, BrokerType } from "./types.ts";

const BASE = "/api";

// ── GET /api/brokers?search=&type= ────────────────────────────────
export async function fetchBrokers(params?: {
  search?: string;
  type?: BrokerType | "";
  signal?: AbortSignal;
}): Promise<Broker[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.type) query.set("type", params.type);

  const url = `${BASE}/brokers${query.toString() ? `?${query}` : ""}`;
  const res = await fetch(url, { signal: params?.signal });

  if (!res.ok) throw new Error("Failed to fetch brokers");

  const json: ApiResponse<Broker[]> = await res.json();
  return json.data;
}

// ── GET /api/brokers/:slug ─────────────────────────────────────────
export async function fetchBroker(
  slug: string,
  options?: { signal?: AbortSignal },
): Promise<Broker> {
  const res = await fetch(`${BASE}/brokers/${slug}`, {
    signal: options?.signal,
  });

  if (!res.ok) throw new Error(`Broker "${slug}" not found`);

  const json: ApiResponse<Broker> = await res.json();
  return json.data;
}

// ── POST /api/brokers ──────────────────────────────────────────────
export async function createBroker(payload: {
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  website: string;
  broker_type: BrokerType;
}): Promise<Broker> {
  const res = await fetch(`${BASE}/brokers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const contentType = res.headers.get("content-type") ?? "";
  const json = contentType.includes("application/json")
    ? await res.json()
    : null;

  if (!res.ok) {
    // Surface validation errors from Zod
    const msg = json?.errors
      ? json.errors
          .map(
            (e: { field: string; message: string }) =>
              `${e.field}: ${e.message}`,
          )
          .join(", ")
      : (json?.message ?? "Failed to create broker");
    throw new Error(msg);
  }

  if (!json?.data) {
    throw new Error("Invalid server response");
  }

  return json.data;
}

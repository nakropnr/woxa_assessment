export type BrokerType = "cfd" | "bond" | "stock" | "crypto";

export interface Broker {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  broker_type: BrokerType;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
}

export interface ApiError {
  success: false;
  message?: string;
  errors?: { field: string; message: string }[];
}

import { existsSync } from "node:fs";

if (process.env.NODE_ENV !== "production" && existsSync(".env")) {
  process.loadEnvFile();
}
import type { MigrationConfig } from "drizzle-orm/migrator";

type APIConfig = {
  port: number;
};

type DBConfig = {
  url: string;
  migrationConfig: MigrationConfig;
};

type Config = {
  api: APIConfig;
  db: DBConfig;
};

const migrationConfig: MigrationConfig = {
  migrationsFolder: "./src/db/out",
};

export const apiConfig: APIConfig = {
  port: Number(envOrThrow("PORT")),
};

export const dbConfig: DBConfig = {
  url: envOrThrow("DB_URL"),
  migrationConfig: migrationConfig,
};

export const config: Config = {
  api: apiConfig,
  db: dbConfig,
};

function envOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

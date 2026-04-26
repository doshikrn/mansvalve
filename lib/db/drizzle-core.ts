import { drizzle } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";

import * as schema from "./schema";

/**
 * Singleton Postgres client + Drizzle wrapper (Node-safe).
 *
 * Import from `@/lib/db/client` in Next.js server code so `server-only` runs.
 * Import from this module from DB adapters and CLI/tsx scripts.
 */

type DbClient = ReturnType<typeof drizzle<typeof schema>>;

type DbGlobal = {
  mansvalveDb?: {
    sql: Sql;
    db: DbClient;
  };
};

const globalStore = globalThis as unknown as DbGlobal;

function createClient(): { sql: Sql; db: DbClient } {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      "DATABASE_URL is not configured. Admin panel features require Postgres.",
    );
  }

  const sqlClient = postgres(url, {
    max: 10,
    idle_timeout: 20,
    prepare: false,
  });

  const db = drizzle(sqlClient, {
    schema,
    logger: process.env.DATABASE_LOG === "true",
  });

  return { sql: sqlClient, db };
}

export function getDb(): DbClient {
  if (!globalStore.mansvalveDb) {
    globalStore.mansvalveDb = createClient();
  }
  return globalStore.mansvalveDb.db;
}

export function getSql(): Sql {
  if (!globalStore.mansvalveDb) {
    globalStore.mansvalveDb = createClient();
  }
  return globalStore.mansvalveDb.sql;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export { schema };

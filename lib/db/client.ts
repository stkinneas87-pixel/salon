import "server-only";

import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

type Database = PostgresJsDatabase<typeof schema>;

const globalForDb = globalThis as unknown as {
  hairCoSql?: ReturnType<typeof postgres>;
  hairCoDb?: Database;
};

export function getDb(): Database | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;

  if (!globalForDb.hairCoDb) {
    const sql = postgres(url, {
      max: 3,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
    });
    globalForDb.hairCoSql = sql;
    globalForDb.hairCoDb = drizzle(sql, { schema });
  }

  return globalForDb.hairCoDb;
}

export function requireDb(): Database {
  const db = getDb();
  if (!db) {
    throw new Error(
      "DATABASE_URL is not configured. Add a Neon Postgres connection string before using the CMS or booking system.",
    );
  }
  return db;
}


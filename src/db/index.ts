import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL;
export const isDbConfigured = Boolean(
  databaseUrl &&
  !databaseUrl.includes("localhost") &&
  !databaseUrl.includes("127.0.0.1") &&
  !databaseUrl.includes("password@localhost")
);

const globalForDb = globalThis as typeof globalThis & {
  __onepointMysqlPool?: mysql.Pool;
};

export const pool: mysql.Pool | null = isDbConfigured && databaseUrl
  ? (globalForDb.__onepointMysqlPool ?? mysql.createPool(databaseUrl))
  : null;

if (isDbConfigured && pool && process.env.NODE_ENV !== "production") {
  globalForDb.__onepointMysqlPool = pool;
}

export const db = pool ? drizzle(pool) : null;

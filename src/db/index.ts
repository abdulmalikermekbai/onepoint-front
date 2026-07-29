import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const databaseUrl =
  process.env.DATABASE_URL ||
  "mysql://onepoint_user:password@localhost:3306/onepoint_laptops";

const globalForDb = globalThis as typeof globalThis & {
  __onepointMysqlPool?: mysql.Pool;
};

export const pool =
  globalForDb.__onepointMysqlPool ??
  mysql.createPool(databaseUrl);

if (process.env.NODE_ENV !== "production") {
  globalForDb.__onepointMysqlPool = pool;
}

export const db = drizzle(pool);

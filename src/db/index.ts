import "server-only";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { serverEnv } from "@/server/env";
import * as schema from "./schema";

/**
 * SOURCE OF TRUTH KEYWORDS: db, database client, drizzle, neon, postgres, pool, transactions, schema
 * WHAT:  The single Drizzle client for Neon Postgres, over Neon's WebSocket pool.
 * WHY:   The WebSocket driver supports transactions, so multi-step writes (e.g. Better Auth creating
 *        a user and its account) succeed or fail together. The HTTP driver can't do that.
 * WHERE: src/server/auth.ts, src/server/summaries.ts.
 */
const globalForDb = globalThis as unknown as { sumzPool?: Pool };
const pool = globalForDb.sumzPool ?? new Pool({ connectionString: serverEnv.DATABASE_URL });
if (process.env.NODE_ENV !== "production") globalForDb.sumzPool = pool;

export const db = drizzle(pool, { schema });
export { schema };

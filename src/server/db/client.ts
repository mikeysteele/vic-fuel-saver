import { type AnyD1Database, drizzle } from "drizzle-orm/d1";
import * as schema from "./schema.ts";

// Because we're currently in an environment (React / Solid / Vite) where the Env
// binding for DB comes through the Cloudflare worker request, we instantiate
// the db per request using the provided binding.
export function createDb(d1Database: AnyD1Database) {
  return drizzle(d1Database, { schema });
}

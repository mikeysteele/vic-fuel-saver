import { createServerFn } from "@tanstack/solid-start";
import { createDb } from "./db/client.ts";
import { prices } from "./db/schema.ts";
import { eq, desc, and } from "drizzle-orm";
import { env } from "cloudflare:workers";

export const getStationPriceHistory = createServerFn({ method: "GET" })
  .inputValidator((d: { stationId: string; fuelType?: string; limit?: number }) => d)
  .handler(async (ctx) => {
    // Cloudflare D1 environment bindings
    const cloudflareEnv = env as any;
    if (!cloudflareEnv?.DB) {
      throw new Error("D1 database binding 'DB' not found");
    }

    const { stationId, fuelType, limit = 50 } = ctx.data;
    const db = createDb(cloudflareEnv.DB);

    // Build the query
    let conditions = [eq(prices.stationId, stationId)];
    if (fuelType) {
      conditions.push(eq(prices.fuelType, fuelType));
    }

    const history = await db.select()
      .from(prices)
      .where(and(...conditions))
      .orderBy(desc(prices.updatedAt))
      .limit(limit);

    return history;
  });

import handler from "@tanstack/solid-start/server-entry";
import { syncFuelPrices } from "./server/cron.ts";
import type {
  ExecutionContext,
  ScheduledEvent,
} from "@cloudflare/workers-types";
import type { AnyD1Database } from "drizzle-orm/d1";

export default {
  fetch: handler.fetch,
  // Handle Cron Triggers
  async scheduled(
    event: ScheduledEvent,
    env: { DB: AnyD1Database },
    ctx: ExecutionContext,
  ) {
    console.log("Cron triggered:", event?.cron);

    if (!env || !env.DB) {
      console.error("D1 database binding missing from environment variables!");
      return;
    }

    try {
      await ctx.waitUntil(syncFuelPrices(env.DB));
      console.log("Cron sync task finished successfully.");
    } catch (error) {
      console.error("Cron sync task failed:", error);
    }
  },
};

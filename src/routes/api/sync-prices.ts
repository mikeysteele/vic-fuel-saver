// deno-lint-ignore-file no-process-global
import { createFileRoute } from "@tanstack/solid-router";
import { syncFuelPrices } from "../../server/cron.ts";
import { getErrorMessage } from "../../lib/utils.ts";
import { env } from "cloudflare:workers";

// @ts-ignore: Deno TS check doesn't have the updated routeTree
export const Route = createFileRoute("/api/sync-prices")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // Get D1 binding specifically
        const d1 = env?.DB || globalThis.DB;

        if (!d1) {
          return new Response(
            JSON.stringify({
              error: "D1 database binding 'DB' not found in environment.",
            }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        // Basic Authentication check
        const authHeader = request.headers.get("Authorization");
        const expectedSecret = (env.CRON_SECRET || "dev-secret") as string;
        const expectedHeader = `Basic ${btoa(`admin:${expectedSecret}`)}`;

        if (
          // @ts-ignore: process might not be defined in Deno
          process.env?.NODE_ENV !== "development" || env.CRON_SECRET
        ) {
          if (authHeader !== expectedHeader) {
            return new Response("Unauthorized", {
              status: 401,
              headers: { "WWW-Authenticate": 'Basic realm="Sync Prices API"' },
            });
          }
        }

        try {
          const result = await syncFuelPrices(d1);
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err: unknown) {
          return new Response(JSON.stringify({ error: getErrorMessage(err) }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});

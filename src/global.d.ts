/// <reference types="@solidjs/start/env" />
/// <reference types="@cloudflare/workers-types" />
/// <reference types="@testing-library/jest-dom/vitest" />

declare global {
  var DB: D1Database | undefined;
  var FUEL_CACHE_KV: KVNamespace | undefined;

  namespace Cloudflare {
    interface Env {
      DB: D1Database;
      FUEL_CACHE_KV?: KVNamespace;
      VIC_FUEL_CONSUMER_ID: string;
      CRON_SECRET?: string;
    }
  }

  interface Env {
    DB: D1Database;
    FUEL_CACHE_KV?: KVNamespace;
    VIC_FUEL_CONSUMER_ID: string;
    CRON_SECRET?: string;
  }
}

export {};

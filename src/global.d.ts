/// <reference types="@solidjs/start/env" />
/// <reference types="@cloudflare/workers-types" />

declare namespace globalThis {
  var DB: D1Database | undefined;
  var FUEL_CACHE_KV: KVNamespace | undefined;
  var self: Window & typeof globalThis;
}

declare namespace Cloudflare {
  // Type of `env`.
  //
  // The specific project can extend `Env` by redeclaring it in project-specific files. Typescript
  // will merge all declarations.
  //
  // You can use `wrangler types` to generate the `Env` type automatically.
  interface Env {
    DB: D1Database;
    FUEL_CACHE_KV: KVNamespace;
    VIC_FUEL_CONSUMER_ID: string;
    CRON_SECRET: string;
  }
}

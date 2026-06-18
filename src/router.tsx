import { createRouter as createTanStackRouter } from "@tanstack/solid-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/solid-router-ssr-query";

import { routeTree } from "./routeTree.gen.ts";
import { queryClient } from "./lib/query-client.ts";
export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  });
  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  });

  return router;
}

declare module "@tanstack/solid-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}

import { createRouter as createTanStackRouter } from "@tanstack/solid-router";

import { routeTree } from "./routeTree.gen.ts";
import { createQueryClient } from "./lib/query-client.ts";
export function getRouter() {
  const queryClient = createQueryClient();
  const router = createTanStackRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  });

  return router;
}

declare module "@tanstack/solid-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}

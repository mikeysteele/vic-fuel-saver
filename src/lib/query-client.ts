import { QueryClient } from "@tanstack/solid-query";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is fresh for 5 minutes — no refetch on window focus within that time
        staleTime: 5 * 60 * 1000,
        // Keep unused data in cache for 10 minutes (only on the client).
        // On the server, set gcTime to 0 to prevent retaining query data.
        gcTime: typeof window === "undefined" ? 0 : 10 * 60 * 1000,
        // Retry failed requests once
        retry: 1,
      },
    },
  });
}

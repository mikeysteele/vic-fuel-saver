import { QueryClient } from "@tanstack/solid-query";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Data is fresh for 5 minutes — no refetch on window focus within that time
            staleTime: 5 * 60 * 1000,
            // Keep unused data in cache for 10 minutes
            gcTime: 10 * 60 * 1000,
            // Retry failed requests once
            retry: 1,
        },
    },
});
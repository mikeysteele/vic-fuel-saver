import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/solid-router";
import { TanStackRouterDevtools } from "@tanstack/solid-router-devtools";
import { type QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { SolidQueryDevtools } from "@tanstack/solid-query-devtools";
import { MetaProvider } from "@solidjs/meta";

import "@fontsource/inter/400.css";

import { HydrationScript } from "solid-js/web";

import styleCss from "../styles.css?url";

import { getThemeFromCookie } from "../server/theme.ts";
import { ThemeProvider, useTheme } from "../lib/theme.tsx";
import { ClientOnly } from "../components/ui/ClientOnly.tsx";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  loader: async () => {
    const theme = await getThemeFromCookie();
    return { theme: theme || "light" };
  },
  head: () => ({
    links: [{ rel: "stylesheet", href: styleCss }],
    meta: [
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
    ],
  }),
  shellComponent: RootComponent,
  errorComponent: ErrorComponent,
  notFoundComponent: () => "Not Found"
});

function getInitialTheme(loaderData: { theme: "light" | "dark" } | undefined) {
  if (typeof window !== "undefined") {
    const match = document.cookie.match(/(?:^|; )theme=([^;]*)/);
    const theme = match ? match[1] : null;
    if (theme === "light" || theme === "dark") {
      return theme;
    }
  }
  return loaderData?.theme || "light";
}

function RootComponent() {
  const data = Route.useLoaderData();
  const context = Route.useRouteContext();
  const { queryClient } = context();

  return (
    <MetaProvider>
      <ThemeProvider initialTheme={getInitialTheme(data())}>
        <QueryClientProvider client={queryClient}>
          <RootHtml />
        </QueryClientProvider>
      </ThemeProvider>
    </MetaProvider>
  );
}
function ErrorComponent() {
  return 'Error'
}
function RootHtml() {
  const { theme } = useTheme();

  return (
    <html lang="en" class={theme() === "dark" ? "dark" : ""}>
      <head>
        <HydrationScript />
      </head>
      <body
        class={`min-h-screen text-slate-200 antialiased selection:bg-purple-500/30`}
      >
        <HeadContent />
        <Outlet />
        <ClientOnly>
          <TanStackRouterDevtools />
          <SolidQueryDevtools initialIsOpen={false} />
        </ClientOnly>
        <Scripts />
      </body>
    </html>
  );
}

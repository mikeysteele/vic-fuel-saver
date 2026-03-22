import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/solid-router";
import { TanStackRouterDevtools } from "@tanstack/solid-router-devtools";
import { type QueryClient } from "@tanstack/solid-query";
import { SolidQueryDevtools } from "@tanstack/solid-query-devtools";
import { MetaProvider } from "@solidjs/meta";

import "@fontsource/inter/400.css";

import { Suspense } from "solid-js";
import { HydrationScript } from "solid-js/web";

import styleCss from "../styles.css?url";



import { getThemeFromCookie } from "../server/theme.ts";
import { ThemeProvider, useTheme } from "../lib/theme.tsx";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  loader: async () => {
    const theme = await getThemeFromCookie();
    return { theme: theme || "light" };
  },
  head: () => ({
    links: [{ rel: "stylesheet", href: styleCss }],
    meta: [
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
    ]
  }),
  shellComponent: RootComponent
});


function RootComponent() {
  const data = Route.useLoaderData();

  return (
    <MetaProvider>
      <ThemeProvider initialTheme={data()?.theme}>
        <RootHtml />
      </ThemeProvider>
    </MetaProvider>
  );
}

function RootHtml() {
  const { theme } = useTheme();

  return (
    <html lang="en" class={theme() === 'dark' ? 'dark' : ''}>
      <head>
        <HydrationScript />
      </head>
      <body class={`min-h-screen text-slate-200 antialiased selection:bg-purple-500/30`}>
        <HeadContent />
        <Suspense>
          <Outlet />
          <TanStackRouterDevtools />
        </Suspense>
        <SolidQueryDevtools initialIsOpen={false} />
        <Scripts />
      </body>
    </html>
  );
}

import { createServerFn } from "@tanstack/solid-start";
import { getCookie, setCookie } from "@tanstack/solid-start/server";

const parseTheme = (theme?: string) => {
  if (!theme) {
    return null;
  }
  const lower = theme.toLowerCase();
  if (lower === "light" || lower === "dark") {
    return lower;
  }
  return null;
}

export const getThemeFromCookie = createServerFn({ method: "GET" }).handler(
  async () => {
    const theme = getCookie("theme");
    return await parseTheme(theme);
  },
);

export const setThemeCookie = createServerFn({ method: "POST" })
  .validator((data: "light" | "dark") => data)
  .handler(async (context) => {
    setCookie("theme", context.data, {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });
    return await context.data;
  });

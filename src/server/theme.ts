import { createServerFn } from "@tanstack/solid-start";
import { getCookie, setCookie } from "@tanstack/solid-start/server";

export const getThemeFromCookie = createServerFn({ method: "GET" }).handler(
  async () => {
    const theme = getCookie("theme");
    return await (theme as "light" | "dark" | null) || null;
  },
);

export const setThemeCookie = createServerFn({ method: "POST" })
  .inputValidator((data: "light" | "dark") => data)
  .handler(async (context) => {
    console.log(context)
    setCookie("theme", context.data, { path: "/", maxAge: 31536000, sameSite: "lax" });
    return await context.data;
  });

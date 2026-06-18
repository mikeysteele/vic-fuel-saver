import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const denoEnv = typeof Deno !== "undefined" ? Deno.env.toObject() : {};

const runtimeEnv = {
  ...denoEnv,
  // deno-lint-ignore no-process-global
  // @ts-ignore: process is not typed in deno by default
  ...(typeof process !== "undefined" ? process.env : {}),
  // @ts-ignore: import.meta.env might not be typed depending on environment
  ...((typeof import.meta !== "undefined" && import.meta.env) ? import.meta.env : {}),
};
export const env = createEnv({
  server: {
    SERVER_URL: z.url().optional(),
    VIC_FUEL_CONSUMER_ID: z.string().default("dummy-consumer-id"),
  },

  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: "VITE_",

  client: {
    VITE_LOGO_DEV_TOKEN: z.string().min(1).default("dummy-token"),
  },

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv,
  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,
});

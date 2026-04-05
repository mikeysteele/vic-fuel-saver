import { defineConfig } from "vitest/config";
import solidPlugin from "vite-plugin-solid";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    solidPlugin(),
    tsconfigPaths(),
  ],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/lib/**", "src/server/**", "src/components/**", "src/features/**"],
      reporter: ["text", "html"],
    },
    alias: {
      "cloudflare:workers": new URL("./src/test/mocks/cloudflare.ts", import.meta.url).pathname
    },
    server: {
      deps: {
        inline: [/@tanstack\/solid-router/]
      }
    }
  },
});

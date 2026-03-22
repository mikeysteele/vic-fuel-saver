import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/solid-start/plugin/vite";
import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { VitePWA } from 'vite-plugin-pwa';

import solidPlugin from "vite-plugin-solid";
import viteTsConfigPaths from "vite-tsconfig-paths";

import viteStaticCopy from "rollup-plugin-copy";

export default defineConfig({
  plugins: [

    devtools(),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart(),
    solidPlugin({ ssr: true }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Fuel Saver Vic',
        short_name: 'FuelSaverVic',
        description: 'Find the cheapest fuel in Victoria',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    }),
    viteStaticCopy({
      targets: [
        {
          src: "./node_modules/leaflet/dist/images/marker-icon.png",
          dest: "dist/client/assets/leaflet",

        },
        {
          src: "./node_modules/leaflet/dist/images/marker-icon-2x.png",
          dest: "dist/client/assets/leaflet",

        },
        {
          src: "./node_modules/leaflet/dist/images/marker-shadow.png",
          dest: "dist/client/assets/leaflet",

        },
      ],
    }),
  ]
});

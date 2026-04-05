import { createServerFn } from "@tanstack/solid-start";
import { env } from "cloudflare:workers";
import type { FuelApiResponse, FuelBrandsResponse } from "../types/fuel.ts";
import { getCache } from "./cache.ts";
import { vicFuelApiClient } from "./vic-fuel-api.ts";
import { FuelRepository } from "./db/fuel_repository.ts";
import { attachTrendsToApiResponse, mapSnapshotRowsToApiResponse } from "./fuel_mappers.ts";
import type { SnapshotRow, TrendRow } from "./fuel_mappers.ts";
import type { AnyD1Database } from "drizzle-orm/d1";

// ─── Constants ───────────────────────────────────────────────────────────────

const PRICES_CACHE_KEY = "vic_fuel_prices_cache";
const PRICES_CACHE_TTL_MS = 60_000; // 60 seconds

const BRANDS_CACHE_KEY = "vic_fuel_brands_cache";
const BRANDS_CACHE_TTL_MS = 24 * 60 * 60 * 1_000; // 24 hours — reference data changes rarely

// ─── Stale-Fallback Helper ───────────────────────────────────────────────────

/**
 * Wraps an async fetcher with stale-data fallback semantics.
 * If the fetcher throws and a stale value was previously stored, returns stale.
 * If there's no stale value, re-throws.
 */
async function withStaleFallback<T>(
  fetcher: () => Promise<T>,
  staleStore: { current: T | null },
  description: string,
): Promise<T> {
  try {
    const result = await fetcher();
    staleStore.current = result; // Keep stale value fresh on each success
    return result;
  } catch (error) {
    console.error(`Failed to fetch ${description}:`, error);
    if (staleStore.current) {
      console.log(
        `Returning stale cached data for ${description} due to fetch error.`,
      );
      return staleStore.current;
    }
    throw error;
  }
}

// ─── Prices ──────────────────────────────────────────────────────────────────

/** In-memory fallback retained across cache evictions */
const pricesStale = { current: null as FuelApiResponse | null };

export const getFuelPrices = createServerFn({ method: "GET" }).handler(
  async (): Promise<FuelApiResponse> => {
    const cache = getCache();

    const cached = await cache.get<FuelApiResponse>(PRICES_CACHE_KEY);
    if (cached) {
      console.log("Returning cached fuel prices");
      return cached;
    }

    return withStaleFallback(
      async () => {
        const data = await vicFuelApiClient.fetchPrices();
        
        // Enhance live data with historical trends from D1
        const cloudflareEnv = env as Record<string, unknown>;
        const d1 = (cloudflareEnv?.DB || (globalThis as Record<string, unknown>).DB || (globalThis as Record<string, unknown>).FUEL_CACHE_KV) as AnyD1Database | undefined;
        if (d1) {
          try {
            const repo = new FuelRepository(d1);
            const snapshot = await repo.getRecentTrends() as TrendRow[];
            attachTrendsToApiResponse(data, snapshot);
          } catch (e) {
            console.error("Failed to attach live trends from D1:", e);
          }
        }

        console.log("Fetched new fuel prices, updating cache");
        await cache.set(PRICES_CACHE_KEY, data, PRICES_CACHE_TTL_MS);
        return data;
      },
      pricesStale,
      "fuel prices",
    );
  },
);

// ─── Historical Snapshots ────────────────────────────────────────────────────

export const getEarliestSyncDate = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ date: string | null }> => {
    const cloudflareEnv = env as Record<string, unknown>;
    const d1 = (cloudflareEnv?.DB || (globalThis as Record<string, unknown>).DB || (globalThis as Record<string, unknown>).FUEL_CACHE_KV) as AnyD1Database | undefined;

    if (!d1) return { date: null };
    
    const repo = new FuelRepository(d1);
    return await repo.getEarliestSyncDate();
  }
);

export const getFuelPricesSnapshot = createServerFn({ method: "GET" })
  .inputValidator((date: string) => date)
  .handler(async (ctx: { data: string }): Promise<FuelApiResponse> => {
    const targetDate = ctx.data; 
    const cloudflareEnv = env as Record<string, unknown>;
    const d1 = (cloudflareEnv?.DB || (globalThis as Record<string, unknown>).DB || (globalThis as Record<string, unknown>).FUEL_CACHE_KV) as AnyD1Database | undefined;

    if (!d1) {
      throw new Error("D1 database binding 'DB' not found");
    }

    const repo = new FuelRepository(d1);
    const rows = await repo.getPricesSnapshot(targetDate) as unknown as SnapshotRow[];
    return mapSnapshotRowsToApiResponse(rows);
  });

// ─── Brands ──────────────────────────────────────────────────────────────────

/** In-memory fallback retained across cache evictions */
const brandsStale = { current: null as FuelBrandsResponse | null };

export const getFuelBrands = createServerFn({ method: "GET" }).handler(
  async (): Promise<FuelBrandsResponse> => {
    const cache = getCache();

    const cached = await cache.get<FuelBrandsResponse>(BRANDS_CACHE_KEY);
    if (cached) {
      console.log("Returning cached fuel brands");
      return cached;
    }

    return withStaleFallback(
      async () => {
        const data = await vicFuelApiClient.fetchBrands();
        console.log("Fetched new fuel brands, updating cache");
        await cache.set(BRANDS_CACHE_KEY, data, BRANDS_CACHE_TTL_MS);
        return data;
      },
      brandsStale,
      "fuel brands",
    );
  },
);

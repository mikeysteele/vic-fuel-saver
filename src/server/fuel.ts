import { createServerFn } from "@tanstack/solid-start";
import { sql } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { createDb } from "./db/client.ts";
import { type AnyD1Database } from "drizzle-orm/d1";
import type { FuelApiResponse, FuelBrandsResponse, FuelPriceDetail, FuelType } from "../types/fuel.ts";
import { getCache } from "./cache.ts";
import { vicFuelApiClient } from "./vic-fuel-api.ts";

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
            const db = createDb(d1);
            type TrendRow = { station_id: string, fuel_type: string, price: number, updated_at: string, prev_price: number | null };
            const snapshot = await db.all(sql`
              WITH UniquePrices AS (
                SELECT DISTINCT station_id, fuel_type, price, updated_at
                FROM prices
                WHERE synced_at >= datetime('now', '-14 days')
              ),
              RankedChanges AS (
                SELECT 
                  station_id, 
                  fuel_type, 
                  price, 
                  updated_at,
                  LAG(price) OVER(PARTITION BY station_id, fuel_type ORDER BY updated_at ASC) as prev_price,
                  ROW_NUMBER() OVER(PARTITION BY station_id, fuel_type ORDER BY updated_at DESC) as rn
                FROM UniquePrices
              )
              SELECT station_id, fuel_type, price, updated_at, prev_price FROM RankedChanges WHERE rn = 1
            `) as TrendRow[];
            
            const prevMap = new Map<string, TrendRow>();
            for (const row of snapshot) prevMap.set(`${row.station_id}_${row.fuel_type}`, row);

            for (const detail of data.fuelPriceDetails) {
              for (const price of detail.fuelPrices) {
                const key = `${detail.fuelStation.id}_${price.fuelType}`;
                const hist = prevMap.get(key);
                if (hist) {
                  // If live API has a strictly newer updated_at, the live price is fresh and not yet synced. 
                  // Thus, the latest DB price is the 'previous' price.
                  if (new Date(price.updatedAt).getTime() > new Date(hist.updated_at).getTime()) {
                    if (price.price > hist.price) price.trend = "up";
                    else if (price.price < hist.price) price.trend = "down";
                    else price.trend = "flat";
                  } else {
                    // Otherwise, live API matches latest DB. Compare to DB's previous price.
                    if (hist.prev_price !== null && hist.prev_price !== undefined) {
                      if (price.price > hist.prev_price) price.trend = "up";
                      else if (price.price < hist.prev_price) price.trend = "down";
                      else price.trend = "flat";
                    }
                  }
                }
              }
            }
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

interface SnapshotRow {
  station_id: string;
  brand_id: string;
  station_name: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  lat: number;
  lng: number;
  fuel_type: string;
  price: number;
  is_available: number;
  updated_at: string;
  previous_price: number | null;
}

export const getEarliestSyncDate = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ date: string | null }> => {
    const cloudflareEnv = env as Record<string, unknown>;
    const d1 = (cloudflareEnv?.DB || (globalThis as Record<string, unknown>).DB || (globalThis as Record<string, unknown>).FUEL_CACHE_KV) as AnyD1Database | undefined;

    if (!d1) return { date: null };
    
    try {
      // Query by synced_at — this represents when WE synced, not when the station updated
      const result = await d1.prepare("SELECT MIN(synced_at) as date FROM prices").all();
      const firstRow = result.results[0] as Record<string, unknown> | undefined;
      return { date: (firstRow?.date as string) || null };
    } catch (e: unknown) {
      try {
        const tables = await d1.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
        const names = tables.results.map((r: Record<string, unknown>) => r.name).join(", ");
        console.error(`D1 Early Date Query failed. Tables: [${names}]. Error: ${e instanceof Error ? e.message : String(e)}`);
      } catch (e2) {
        console.error("Critical D1 failure in getEarliestSyncDate:", e2);
      }
      return { date: null };
    }
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

    const db = createDb(d1);

    // This query finds the latest sync snapshot for each (station_id, fuel_type)
    // that occurred on or before targetDate. We use synced_at (our sync time)
    // rather than updated_at (the API's per-station timestamp) so we get a full
    // set of stations from the most recent sync before the chosen date.
    const latestPrices = await db.all(sql`
      WITH UniquePrices AS (
        SELECT DISTINCT station_id, fuel_type, price, is_available, updated_at
        FROM prices
        WHERE synced_at <= ${targetDate} AND synced_at >= datetime(${targetDate}, '-14 days')
      ),
      RankedChanges AS (
        SELECT 
          station_id, 
          fuel_type, 
          price, 
          is_available, 
          updated_at,
          LAG(price) OVER(PARTITION BY station_id, fuel_type ORDER BY updated_at ASC) as prev_price,
          ROW_NUMBER() OVER(PARTITION BY station_id, fuel_type ORDER BY updated_at DESC) as rn
        FROM UniquePrices
      )
      SELECT 
        s.id as station_id,
        s.brand_id,
        s.name as station_name,
        s.address,
        s.suburb,
        s.state,
        s.postcode,
        s.lat,
        s.lng,
        rc.fuel_type,
        rc.price,
        rc.is_available,
        rc.updated_at,
        rc.prev_price as previous_price
      FROM stations s
      JOIN RankedChanges rc ON s.id = rc.station_id AND rc.rn = 1
    `);

    // Grouping rows into the FuelApiResponse structure
    const rows = latestPrices as unknown as SnapshotRow[];
    const detailMap = new Map<string, FuelPriceDetail>();

    for (const row of rows) {
      if (!detailMap.has(row.station_id)) {
        detailMap.set(row.station_id, {
          fuelStation: {
            id: row.station_id,
            brandId: row.brand_id,
            name: row.station_name,
            address: row.address,
            suburb: row.suburb,
            state: row.state,
            postcode: row.postcode,
            location: { latitude: row.lat, longitude: row.lng },
          },
          fuelPrices: [],
          updatedAt: row.updated_at,
        });
      }

      const detail = detailMap.get(row.station_id)!;
      let trend: "up" | "down" | "flat" | undefined;
      
      if (row.previous_price !== null && row.previous_price !== undefined) {
         if (row.price > row.previous_price) trend = "up";
         else if (row.price < row.previous_price) trend = "down";
         else trend = "flat";
      }

      detail.fuelPrices.push({
        fuelType: row.fuel_type as FuelType,
        price: row.price,
        isAvailable: Boolean(row.is_available),
        updatedAt: row.updated_at,
        trend,
      });

      // Keep updatedAt as the latest one in the detail
      if (row.updated_at > detail.updatedAt) {
        detail.updatedAt = row.updated_at;
      }
    }

    return {
      fuelPriceDetails: Array.from(detailMap.values()),
    };
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

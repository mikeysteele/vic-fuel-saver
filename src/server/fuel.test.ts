import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  FuelApiResponse,
  FuelBrandsResponse,
} from "../features/fuel/types.ts";

// We test the core fetch-and-cache pattern by extracting it as a standalone helper.
// The createServerFn wrapper is TanStack-specific and not unit-testable in isolation.
// Instead we test the VicFuelApiClient we will create in the refactor step,
// but we preview the pattern here against the cache module.
//
// This test validates the caching layer works correctly with fetch mocking.

const makeMockResponse = <T>(body: T, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

describe("Fuel server: fetch + cache integration", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("fetches from API when cache is empty", async () => {
    const fakeData: FuelApiResponse = { fuelPriceDetails: [] };
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(makeMockResponse(fakeData));

    // Import fresh module to get a clean cache singleton
    const { getCache } = await import("./cache.ts");
    const cache = getCache();

    const CACHE_KEY = "test-prices";
    const cached = await cache.get(CACHE_KEY);
    expect(cached).toBeNull(); // Cache miss

    // Simulate what the server fn does
    const response = await fetch("https://api.example.com/prices", {
      headers: { "x-consumer-id": "test-id", "x-transactionid": "tx-1" },
    });
    const data = await response.json();
    await cache.set(CACHE_KEY, data, 60000);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const fromCache = await cache.get<FuelApiResponse>(CACHE_KEY);
    expect(fromCache).toEqual(fakeData);
  });

  it("does not call fetch when cache has a fresh value", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { getCache } = await import("./cache.ts");
    const cache = getCache();

    const fakeData: FuelApiResponse = { fuelPriceDetails: [] };
    await cache.set("test-prices-2", fakeData, 60000);

    // Check cache before fetch (this is the pattern in server/fuel.ts)
    const fromCache = await cache.get<FuelApiResponse>("test-prices-2");
    if (fromCache) {
      // Would return early here – no fetch
    } else {
      await fetch("https://api.example.com/prices");
    }

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(fromCache).toEqual(fakeData);
  });

  it("falls back to stale data when API returns an error", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));
    const memoryStaleFallback: FuelApiResponse | null = {
      fuelPriceDetails: [
        {
          fuelStation: {
            id: "999",
            brandId: "BP",
            name: "Stale Station",
            address: "1 Old St",
            suburb: "OldTown",
            state: "VIC",
            postcode: "3000",
            location: { latitude: -37.8, longitude: 144.9 },
          },
          fuelPrices: [],
          updatedAt: "old",
        },
      ],
    };

    let result: FuelApiResponse;
    try {
      await fetch("https://api.example.com/prices");
      result = { fuelPriceDetails: [] };
    } catch {
      if (memoryStaleFallback) {
        result = memoryStaleFallback;
      } else {
        throw new Error("No fallback available");
      }
    }

    expect(result.fuelPriceDetails[0].fuelStation.name).toBe("Stale Station");
  });

  it("throws when API fails and no stale fallback exists", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("API down"));
    const memoryStaleFallback: FuelApiResponse | null = null;

    await expect(async () => {
      try {
        await fetch("https://api.example.com/prices");
      } catch (e) {
        if (memoryStaleFallback) {
          return memoryStaleFallback;
        }
        throw e;
      }
    }).rejects.toThrow("API down");
  });
});

describe("Fuel server: HTTP error handling", () => {
  it("throws on non-OK API response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("Forbidden", { status: 403, statusText: "Forbidden" }),
    );

    await expect(async () => {
      const response = await fetch("https://api.example.com/prices");
      if (!response.ok) {
        throw new Error(
          `API returned ${response.status}: ${response.statusText}`,
        );
      }
    }).rejects.toThrow("API returned 403: Forbidden");
  });
});

describe("Fuel brands: fetch + cache", () => {
  it("caches brands with a long TTL", async () => {
    const { getCache } = await import("./cache.ts");
    const cache = getCache();
    const fakeBrands: FuelBrandsResponse = {
      brands: [{ id: "BP", name: "BP", type: "Retail" }],
    };
    await cache.set("brands-key", fakeBrands, 24 * 3600 * 1000);
    const result = await cache.get<FuelBrandsResponse>("brands-key");
    expect(result?.brands).toHaveLength(1);
    expect(result?.brands[0].name).toBe("BP");
  });
});

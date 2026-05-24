import { describe, expect, it } from "vitest";
import type { FuelPriceDetail } from "./types.ts";
import { computeAggregates } from "./aggregates.ts";

const makeStation = (
  id: string,
  lat = -37.8,
  lng = 144.9,
): FuelPriceDetail["fuelStation"] => ({
  id,
  brandId: "BP",
  name: `Station ${id}`,
  address: "1 Test St",
  suburb: "Melbourne",
  state: "VIC",
  postcode: "3000",
  location: { latitude: lat, longitude: lng },
});

describe("computeAggregates", () => {
  it("returns empty object for empty station array", () => {
    expect(computeAggregates([])).toEqual({});
  });

  it("computes correct avg/min/max for a single available price", () => {
    const stations: FuelPriceDetail[] = [
      {
        fuelStation: makeStation("1"),
        fuelPrices: [
          { fuelType: "U91", price: 180.0, isAvailable: true, updatedAt: "" },
        ],
        updatedAt: "",
      },
    ];
    const result = computeAggregates(stations);
    expect(result["U91"]).toBeDefined();
    expect(result["U91"].avg).toBe(180.0);
    expect(result["U91"].min?.price).toBe(180.0);
    expect(result["U91"].max?.price).toBe(180.0);
    expect(result["U91"].min?.stationId).toBe("1");
  });

  it("excludes prices where isAvailable is false", () => {
    const stations: FuelPriceDetail[] = [
      {
        fuelStation: makeStation("1"),
        fuelPrices: [
          { fuelType: "U91", price: 180.0, isAvailable: false, updatedAt: "" },
        ],
        updatedAt: "",
      },
    ];
    expect(computeAggregates(stations)).toEqual({});
  });

  it("excludes prices where price is 0", () => {
    const stations: FuelPriceDetail[] = [
      {
        fuelStation: makeStation("1"),
        fuelPrices: [
          { fuelType: "U91", price: 0, isAvailable: true, updatedAt: "" },
        ],
        updatedAt: "",
      },
    ];
    expect(computeAggregates(stations)).toEqual({});
  });

  it("computes correct min and max across multiple stations", () => {
    const stations: FuelPriceDetail[] = [
      {
        fuelStation: makeStation("1"),
        fuelPrices: [
          { fuelType: "U91", price: 170.0, isAvailable: true, updatedAt: "" },
        ],
        updatedAt: "",
      },
      {
        fuelStation: makeStation("2"),
        fuelPrices: [
          { fuelType: "U91", price: 190.0, isAvailable: true, updatedAt: "" },
        ],
        updatedAt: "",
      },
      {
        fuelStation: makeStation("3"),
        fuelPrices: [
          { fuelType: "U91", price: 180.0, isAvailable: true, updatedAt: "" },
        ],
        updatedAt: "",
      },
    ];
    const result = computeAggregates(stations);
    expect(result["U91"].avg).toBeCloseTo(180.0);
    expect(result["U91"].min?.price).toBe(170.0);
    expect(result["U91"].min?.stationId).toBe("1");
    expect(result["U91"].max?.price).toBe(190.0);
    expect(result["U91"].max?.stationId).toBe("2");
  });

  it("aggregates multiple fuel types independently", () => {
    const stations: FuelPriceDetail[] = [
      {
        fuelStation: makeStation("1"),
        fuelPrices: [
          { fuelType: "U91", price: 160.0, isAvailable: true, updatedAt: "" },
          { fuelType: "P98", price: 200.0, isAvailable: true, updatedAt: "" },
        ],
        updatedAt: "",
      },
    ];
    const result = computeAggregates(stations);
    expect(result["U91"].avg).toBe(160.0);
    expect(result["P98"].avg).toBe(200.0);
  });

  it("correctly stores lat/lng in min/max stats", () => {
    const stations: FuelPriceDetail[] = [
      {
        fuelStation: makeStation("1", -37.5, 144.5),
        fuelPrices: [
          { fuelType: "U91", price: 170.0, isAvailable: true, updatedAt: "" },
        ],
        updatedAt: "",
      },
    ];
    const result = computeAggregates(stations);
    expect(result["U91"].min?.lat).toBe(-37.5);
    expect(result["U91"].min?.lng).toBe(144.5);
  });
});

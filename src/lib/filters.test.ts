import { describe, expect, it } from "vitest";
import type { FuelPriceDetail, FuelType } from "../types/fuel.ts";
import { filterAndSortStations } from "./filters.ts";

const makeStation = (
  id: string,
  brandId: string,
  prices: Array<{ fuelType: FuelType; price: number }>,
): FuelPriceDetail => ({
  fuelStation: {
    id,
    brandId,
    name: `Station ${id}`,
    address: "1 Test St",
    suburb: "Testville",
    state: "VIC",
    postcode: "3000",
    location: { latitude: -37.8, longitude: 144.9 },
  },
  fuelPrices: prices.map((p) => ({
    fuelType: p.fuelType,
    price: p.price,
    isAvailable: true,
    updatedAt: "",
  })),
  updatedAt: "",
});

const stationBP_U91_180 = makeStation("1", "BP", [
  { fuelType: "U91", price: 180 },
]);
const stationShell_U91_160 = makeStation("2", "SHELL", [
  { fuelType: "U91", price: 160 },
]);
const stationBP_P98_200 = makeStation("3", "BP", [
  { fuelType: "P98", price: 200 },
]);
const stationShell_P98_190 = makeStation("4", "SHELL", [
  { fuelType: "P98", price: 190 },
]);

const allStations = [
  stationBP_U91_180,
  stationShell_U91_160,
  stationBP_P98_200,
  stationShell_P98_190,
];

describe("filterAndSortStations", () => {
  it("returns all stations when no filters are active", () => {
    const result = filterAndSortStations(allStations, [], []);
    expect(result).toHaveLength(4);
  });

  it("filters by brand", () => {
    const result = filterAndSortStations(allStations, ["BP"], []);
    expect(result).toHaveLength(2);
    expect(result.every((s) => s.fuelStation.brandId === "BP")).toBe(true);
  });

  it("filters by fuel type", () => {
    const result = filterAndSortStations(allStations, [], ["U91"]);
    expect(result).toHaveLength(2);
    expect(
      result.every((s) => s.fuelPrices.some((p) => p.fuelType === "U91")),
    ).toBe(true);
  });

  it("sorts by primary fuel type price (cheapest first)", () => {
    const result = filterAndSortStations(allStations, [], ["U91"]);
    expect(result[0].fuelStation.id).toBe(2); // Shell at 160 is cheapest
    expect(result[1].fuelStation.id).toBe(1); // BP at 180 is more expensive
  });

  it("combines brand and fuel type filters", () => {
    const result = filterAndSortStations(allStations, ["SHELL"], ["U91"]);
    expect(result).toHaveLength(1);
    expect(result[0].fuelStation.id).toBe(2);
  });

  it("returns empty array when no stations match filters", () => {
    const result = filterAndSortStations(allStations, ["COSTCO"], ["U91"]);
    expect(result).toHaveLength(0);
  });

  it("does not mutate the original array", () => {
    const original = [...allStations];
    filterAndSortStations(allStations, [], ["U91"]);
    expect(allStations).toEqual(original);
  });

  it("sorts stations without the primary fuel type to the end (Infinity price)", () => {
    // stationBP_P98_200 has no U91 price → should sort last
    const result = filterAndSortStations(
      [stationBP_P98_200, stationBP_U91_180, stationShell_U91_160],
      [],
      ["U91"],
    );
    // P98-only station has no U91, so it's filtered out from results (not matching fuel filter)
    expect(result).toHaveLength(2);
  });
});

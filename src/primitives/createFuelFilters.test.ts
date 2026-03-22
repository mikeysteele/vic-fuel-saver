import { createRoot } from "solid-js";
import { describe, expect, it } from "vitest";
import { createFuelFilters } from "./createFuelFilters.ts";
import type { FuelApiResponse, FuelPriceDetail } from "../types/fuel.ts";

// ── Helpers ───────────────────────────────────────────────────────────────────

const makeStation = (
  id: number,
  brandId: string,
  fuelType: string,
  price: number,
): FuelPriceDetail => ({
  fuelStation: {
    id,
    brandId,
    name: `Station ${id}`,
    address: "1 Test St",
    suburb: "Melbourne",
    state: "VIC",
    postcode: "3000",
    location: { latitude: -37.8, longitude: 144.9 },
  },
  fuelPrices: [
    {
      fuelType: fuelType as never,
      price,
      isAvailable: true,
      updatedAt: "",
    },
  ],
  updatedAt: "",
});

const station1 = makeStation(1, "BP", "U91", 180);
const station2 = makeStation(2, "SHELL", "U91", 160);
const station3 = makeStation(3, "BP", "P98", 200);

const makeData = (stations: FuelPriceDetail[]): FuelApiResponse => ({
  fuelPriceDetails: stations,
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("createFuelFilters", () => {
  it("initialises with empty filters and null location", () => {
    createRoot((dispose) => {
      const filters = createFuelFilters(() => undefined);
      expect(filters.selectedFuelTypes()).toEqual([]);
      expect(filters.selectedBrandIds()).toEqual([]);
      expect(filters.userLocation()).toBeNull();
      dispose();
    });
  });

  it("returns empty filteredStations when data is undefined", () => {
    createRoot((dispose) => {
      const filters = createFuelFilters(() => undefined);
      expect(filters.filteredStations()).toEqual([]);
      dispose();
    });
  });

  it("returns all stations when no filters are applied", () => {
    createRoot((dispose) => {
      const data = makeData([station1, station2, station3]);
      const filters = createFuelFilters(() => data);
      expect(filters.filteredStations()).toHaveLength(3);
      dispose();
    });
  });

  it("setSelectedFuelTypes filters stations reactively", () => {
    createRoot((dispose) => {
      const data = makeData([station1, station2, station3]);
      const filters = createFuelFilters(() => data);

      filters.setSelectedFuelTypes(["P98"]);
      expect(filters.filteredStations()).toHaveLength(1);
      expect(filters.filteredStations()[0].fuelStation.id).toBe(3);
      dispose();
    });
  });

  it("setSelectedBrandIds filters stations reactively", () => {
    createRoot((dispose) => {
      const data = makeData([station1, station2, station3]);
      const filters = createFuelFilters(() => data);

      filters.setSelectedBrandIds(["SHELL"]);
      expect(filters.filteredStations()).toHaveLength(1);
      expect(filters.filteredStations()[0].fuelStation.id).toBe(2);
      dispose();
    });
  });

  it("combines fuel type and brand filters", () => {
    createRoot((dispose) => {
      const data = makeData([station1, station2, station3]);
      const filters = createFuelFilters(() => data);

      filters.setSelectedFuelTypes(["U91"]);
      filters.setSelectedBrandIds(["BP"]);
      expect(filters.filteredStations()).toHaveLength(1);
      expect(filters.filteredStations()[0].fuelStation.id).toBe(1);
      dispose();
    });
  });

  it("clearing filters returns all stations", () => {
    createRoot((dispose) => {
      const data = makeData([station1, station2, station3]);
      const filters = createFuelFilters(() => data);

      filters.setSelectedFuelTypes(["P98"]);
      expect(filters.filteredStations()).toHaveLength(1);

      filters.setSelectedFuelTypes([]);
      expect(filters.filteredStations()).toHaveLength(3);
      dispose();
    });
  });

  it("setUserLocation updates location signal", () => {
    createRoot((dispose) => {
      const filters = createFuelFilters(() => undefined);
      expect(filters.userLocation()).toBeNull();

      filters.setUserLocation({ latitude: -37.8, longitude: 144.9 });
      expect(filters.userLocation()).toEqual({ latitude: -37.8, longitude: 144.9 });

      filters.setUserLocation(null);
      expect(filters.userLocation()).toBeNull();
      dispose();
    });
  });

  it("returns empty array when no stations match combined filters", () => {
    createRoot((dispose) => {
      const data = makeData([station1, station2]);
      const filters = createFuelFilters(() => data);

      filters.setSelectedBrandIds(["COSTCO"]);
      expect(filters.filteredStations()).toHaveLength(0);
      dispose();
    });
  });
});

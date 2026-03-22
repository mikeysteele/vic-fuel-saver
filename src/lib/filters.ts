import type { FuelPrice, FuelPriceDetail } from "../types/fuel.ts";

/**
 * Pure function: filter stations by brand + fuel type, sort by primary fuel price.
 * Performs no side-effects and depends on no reactive state.
 */
export function filterAndSortStations(
  stations: FuelPriceDetail[],
  selectedBrandIds: string[],
  selectedFuelTypes: string[],
): FuelPriceDetail[] {
  let result = stations;

  if (selectedBrandIds.length > 0) {
    result = result.filter((s) =>
      selectedBrandIds.includes(s.fuelStation.brandId)
    );
  }

  if (selectedFuelTypes.length > 0) {
    result = result.filter((s) =>
      s.fuelPrices.some((p: FuelPrice) =>
        selectedFuelTypes.includes(p.fuelType)
      )
    );

    const primaryFuel = selectedFuelTypes[0];
    result = result.slice().sort((a, b) => {
      const priceA = a.fuelPrices.find((p) =>
        p.fuelType === primaryFuel
      )?.price ??
        Number.POSITIVE_INFINITY;
      const priceB = b.fuelPrices.find((p) =>
        p.fuelType === primaryFuel
      )?.price ??
        Number.POSITIVE_INFINITY;
      return priceA - priceB;
    });
  }

  return result;
}

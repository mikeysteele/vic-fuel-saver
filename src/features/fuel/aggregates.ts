import type {
  FuelMetricsAggregate,
  FuelMetricStat,
  FuelPriceDetail,
} from "./types.ts";

/**
 * Computes min/max/avg price aggregates per fuel type across the given stations.
 * Prices with `price <= 0` or `isAvailable === false` are excluded.
 */
export function computeAggregates(
  stations: FuelPriceDetail[],
): Record<string, FuelMetricsAggregate> {
  const accumulator: Record<
    string,
    {
      sum: number;
      count: number;
      min: FuelMetricStat | null;
      max: FuelMetricStat | null;
    }
  > = {};

  for (const station of stations) {
    for (const p of station.fuelPrices) {
      if (p.price > 0 && p.isAvailable) {
        const type = p.fuelType;
        if (!accumulator[type]) {
          accumulator[type] = { sum: 0, count: 0, min: null, max: null };
        }

        const stat: FuelMetricStat = {
          price: p.price,
          stationId: station.fuelStation.id,
          lat: station.fuelStation.location.latitude,
          lng: station.fuelStation.location.longitude,
        };

        accumulator[type].sum += p.price;
        accumulator[type].count++;

        const current = accumulator[type];
        if (!current.min || p.price < current.min.price) {
          accumulator[type].min = stat;
        }
        if (!current.max || p.price > current.max.price) {
          accumulator[type].max = stat;
        }
      }
    }
  }

  const result: Record<string, FuelMetricsAggregate> = {};
  for (const type in accumulator) {
    result[type] = {
      avg: accumulator[type].sum / accumulator[type].count,
      min: accumulator[type].min,
      max: accumulator[type].max,
    };
  }
  return result;
}

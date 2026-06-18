import { createQuery } from "@tanstack/solid-query";
import { useQueryClient } from "@tanstack/solid-query";
import { createSignal } from "solid-js";
import {
  getEarliestSyncDate,
  getFuelBrands,
  getFuelPrices,
  getFuelPricesSnapshot,
} from "~/server/fuel.ts";
import type { FuelApiResponse, FuelBrandsResponse } from "./types.ts";

import { getVictorianISODate } from "~/lib/date.ts";
export const fuelQueryKeys = {
  prices: (date: string | null) => ["fuel", "prices", date] as const,
  brands: ["fuel", "brands"] as const,
  earliest: ["fuel", "earliest"] as const,
};

export function createFuelData() {
  const queryClient = useQueryClient();
  // Store as plain YYYY-MM-DD string (Victorian time) — avoids UTC vs AEST timezone corruption.
  // null = live mode.
  const [selectedDate, setSelectedDate] = createSignal<string | null>(null);

  const pricesQuery = createQuery<FuelApiResponse>(() => {
    const date = selectedDate();
    // Append end-of-day in UTC+11 (AEDT). This targets everything synced on that day in Vic time.
    // e.g. "2026-03-25" → "2026-03-25T13:59:59Z" (end of 2026-03-26 00:59 AEDT, safely covers the day)
    const snapshotTs = date ? `${date}T13:59:59Z` : null;

    return {
      queryKey: fuelQueryKeys.prices(date),
      queryFn: () =>
        snapshotTs
          ? getFuelPricesSnapshot({ data: snapshotTs })
          : getFuelPrices(),
      staleTime: date ? 24 * 60 * 60 * 1000 : 5 * 60 * 1000,
      placeholderData: (prev) => prev,
    };
  });

  const earliestQuery = createQuery(() => ({
    queryKey: fuelQueryKeys.earliest,
    queryFn: () => getEarliestSyncDate(),
    staleTime: Infinity,
  }));

  const brandsQuery = createQuery<FuelBrandsResponse>(() => ({
    queryKey: fuelQueryKeys.brands,
    queryFn: () => getFuelBrands(),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  }));

  const refetch = () => {
    queryClient.invalidateQueries({
      queryKey: fuelQueryKeys.prices(selectedDate()),
    });
  };

  const brandMap = () => {
    const map: Record<string, string> = {};
    if (brandsQuery.data) {
      brandsQuery.data.brands.forEach((b) => {
        map[b.id] = b.name;
      });
    }
    return map;
  };

  const uniqueFuelTypes = () => {
    if (!pricesQuery.data) return [];
    const types = new Set<string>();
    pricesQuery.data.fuelPriceDetails.forEach((station) => {
      station.fuelPrices.forEach((price) => {
        types.add(price.fuelType);
      });
    });
    return Array.from(types).sort();
  };

  const uniqueBrands = () => {
    if (!pricesQuery.data) return [];
    const brands = new Set<string>();
    pricesQuery.data.fuelPriceDetails.forEach((station) => {
      brands.add(station.fuelStation.brandId);
    });
    return Array.from(brands).sort((a, b) => {
      const map = brandMap();
      const nameA = map[a] || a;
      const nameB = map[b] || b;
      return nameA.localeCompare(nameB);
    });
  };

  const latestUpdatedAt = () => {
    const details = pricesQuery.data?.fuelPriceDetails;
    if (!details?.length) return null;
    return details.reduce((latest, s) => {
      return s.updatedAt > latest ? s.updatedAt : latest;
    }, details[0].updatedAt);
  };

  // Derive Date objects from the string date for the UI, using safe parsing
  const selectedDateObj = () => {
    const d = selectedDate();
    if (!d) return null;
    // Parse YYYY-MM-DD as local midnight (not UTC) to avoid day-shift
    const [year, month, day] = d.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const setSelectedDateFromObj = (date: Date | null) => {
    if (!date) {
      setSelectedDate(null);
      return;
    }
    // Convert back to YYYY-MM-DD using local date parts (not UTC)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    setSelectedDate(`${year}-${month}-${day}`);
  };

  return {
    data: () => pricesQuery.data,
    refetch,
    loading: () => pricesQuery.isPending,
    error: () => pricesQuery.error || brandsQuery.error,
    uniqueFuelTypes,
    uniqueBrands,
    brandMap,
    latestUpdatedAt,
    selectedDate: selectedDateObj,
    setSelectedDate: setSelectedDateFromObj,
    earliestDate: () => {
      const d = earliestQuery.data?.date;
      if (!d) return null;
      // Convert to Victorian date string to handle UTC -> AEDT shift cleanly
      const vicStr = getVictorianISODate(new Date(d)) || d.split("T")[0];
      const [year, month, day] = vicStr.split("-").map(Number);
      return new Date(year, month - 1, day);
    },
  };
}

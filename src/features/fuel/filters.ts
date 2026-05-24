import { createMemo, createSignal } from "solid-js";
import { filterAndSortStations } from "./filter-utils.ts";
import type { FuelApiResponse } from "./types.ts";

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export function createFuelFilters(dataAccessor: () => FuelApiResponse | undefined) {
  const [selectedFuelTypes, setSelectedFuelTypes] = createSignal<string[]>([]);
  const [selectedBrandIds, setSelectedBrandIds] = createSignal<string[]>([]);
  const [userLocation, setUserLocation] = createSignal<UserLocation | null>(
    null,
  );
  const [mapBounds, setMapBounds] = createSignal<MapBounds | null>(null);

  const filteredStations = createMemo(() => {
    const data = dataAccessor();
    if (!data) return [];
    return filterAndSortStations(
      data.fuelPriceDetails,
      selectedBrandIds(),
      selectedFuelTypes(),
    );
  });

  const stationsInView = createMemo(() => {
    const stations = filteredStations();
    const bounds = mapBounds();
    if (!bounds) return stations;

    return stations.filter((s) => {
      const { latitude: lat, longitude: lng } = s.fuelStation.location;
      return (
        lat <= bounds.north &&
        lat >= bounds.south &&
        lng <= bounds.east &&
        lng >= bounds.west
      );
    });
  });

  return {
    selectedFuelTypes,
    setSelectedFuelTypes,
    selectedBrandIds,
    setSelectedBrandIds,
    userLocation,
    setUserLocation,
    mapBounds,
    setMapBounds,
    filteredStations,
    stationsInView,
  };
}

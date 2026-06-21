import { createMemo, createSignal, Show } from "solid-js";
import { Title } from "@solidjs/meta";

import { computeAggregates } from "~/features/fuel/aggregates.ts";
import { createFuelData } from "~/features/fuel/data.ts";
import { createFuelFilters } from "~/features/fuel/filters.ts";
import { useTheme } from "~/lib/theme.tsx";
import type {
  FuelMetricStat,
  FuelPriceDetail as _FuelPriceDetail,
} from "~/features/fuel/types.ts";

import { FilterBarContainer } from "~/components/dashboard/FilterBarContainer.tsx";
import { Header } from "~/components/layout/Header.tsx";
import { Attribution } from "~/components/layout/Attribution.tsx";
import { AppOverlays } from "~/components/dashboard/AppOverlays.tsx";
import { MapViewLayer } from "~/components/dashboard/MapViewLayer.tsx";
import { ListViewLayer } from "~/components/dashboard/ListViewLayer.tsx";
import { ViewControls } from "~/components/dashboard/ViewControls.tsx";
import { DateNavigator } from "~/components/dashboard/DateNavigator.tsx";

export function Home() {
  const { theme, toggleTheme } = useTheme();
  const {
    data,
    refetch,
    loading,
    pricesLoading,
    error,
    uniqueFuelTypes,
    uniqueBrands,
    brandMap,
    latestUpdatedAt,
    selectedDate,
    setSelectedDate,
    earliestDate,
  } = createFuelData();
  const {
    selectedFuelTypes,
    setSelectedFuelTypes,
    selectedBrandIds,
    setSelectedBrandIds,
    userLocation,
    setUserLocation,
    setMapBounds,
    filteredStations,
    stationsInView,
  } = createFuelFilters(data);

  const [viewMode, setViewMode] = createSignal<"map" | "list">("map");
  const [mapFocus, setMapFocus] = createSignal<FuelMetricStat | null>(null);

  const stateMetrics = createMemo(() => computeAggregates(filteredStations()));
  const areaMetrics = createMemo(() => {
    const stations = stationsInView();
    return computeAggregates(stations);
  });

  return (
    <>
      <Title>FuelSaver - Find the Cheapest Fuel</Title>
      <main class="h-screen font-sans antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 selection:bg-orange-500/30 overflow-hidden flex flex-col relative w-full">
        {/* ── Header ─────────────────────────────────────────────── */}
        <Header
          theme={theme}
          toggleTheme={toggleTheme}
          latestUpdatedAt={latestUpdatedAt}
        />

        {/* ── Body ───────────────────────────────────────────────── */}
        <div class="flex-1 relative w-full h-full">
          <AppOverlays
            loading={loading}
            error={error}
            refetch={refetch}
          />

          <Show when={data()}>
            {/* Map layer */}
            <MapViewLayer
              viewMode={viewMode}
              stations={stationsInView()}
              userLocation={userLocation()}
              selectedFuelTypes={selectedFuelTypes()}
              brandMap={brandMap()}
              onViewportChange={setMapBounds}
              stateMetrics={stateMetrics()}
              areaMetrics={areaMetrics()}
              mapFocus={mapFocus()}
              isDark={theme() !== "light"}
              pricesLoading={pricesLoading()}
            />

            {/* Filter bar */}
            <FilterBarContainer
              fuelTypes={uniqueFuelTypes()}
              brands={uniqueBrands()}
              brandMap={brandMap()}
              selectedFuelTypes={selectedFuelTypes()}
              selectedBrandIds={selectedBrandIds()}
              userLocation={userLocation()}
              onFuelTypesChange={setSelectedFuelTypes}
              onBrandIdsChange={setSelectedBrandIds}
              onUserLocationChange={setUserLocation}
            />

            {/* Bottom HUD: metrics + view toggle */}
            <ViewControls
              selectedFuelTypes={selectedFuelTypes()}
              stateMetrics={stateMetrics()}
              areaMetrics={areaMetrics()}
              pricesLoading={pricesLoading()}
              onFocusStation={(stat) => {
                setViewMode("map");
                setMapFocus(stat);
              }}
              viewMode={viewMode()}
              setViewMode={setViewMode}
              dateNavigator={
                <DateNavigator
                  selectedDate={selectedDate()}
                  onDateChange={setSelectedDate}
                  earliestDate={earliestDate()}
                />
              }
            />

            {/* List view */}
            <ListViewLayer
              viewMode={viewMode()}
              stations={filteredStations()}
              selectedFuelTypes={selectedFuelTypes()}
              brandMap={brandMap()}
              stateMetrics={stateMetrics()}
              areaMetrics={areaMetrics()}
            />
          </Show>
        </div>

        <Attribution />
      </main>
    </>
  );
}

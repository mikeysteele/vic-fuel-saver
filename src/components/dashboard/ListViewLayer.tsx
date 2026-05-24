import { For, Show  } from "solid-js";
import { FuelStationCard } from "../station/FuelStationCard.tsx";
import type { FuelMetricsAggregate, FuelPriceDetail } from "~/features/fuel/types.ts";

interface ListViewLayerProps {
  viewMode: "map" | "list";
  stations: FuelPriceDetail[];
  selectedFuelTypes: string[];
  brandMap: Record<string, string>;
  stateMetrics: Record<string, FuelMetricsAggregate>;
  areaMetrics: Record<string, FuelMetricsAggregate>;
}

export function ListViewLayer(props: ListViewLayerProps) {
  return (
    <Show when={props.viewMode === "list"}>
      <div class="absolute inset-0 z-10 bg-slate-50 dark:bg-slate-950 overflow-y-auto pt-36 pb-44 px-4 sm:px-6 lg:px-8">
        <div class="max-w-7xl mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            <For each={props.stations.slice(0, 50)}>
              {(stationData) => (
                <FuelStationCard
                  station={stationData.fuelStation}
                  prices={stationData.fuelPrices}
                  selectedFuelTypes={props.selectedFuelTypes}
                  brandMap={props.brandMap}
                  stateMetrics={props.stateMetrics}
                  areaMetrics={props.areaMetrics}
                />
              )}
            </For>
          </div>

          <Show when={props.stations.length === 0}>
            <div class="flex flex-col items-center justify-center p-24 mt-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/20 backdrop-blur-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="w-16 h-16 text-slate-400 dark:text-slate-600 mb-4"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <h3 class="text-xl font-medium text-slate-700 dark:text-slate-300">
                No stations found
              </h3>
              <p class="text-slate-500 mt-2 max-w-sm">
                Try adjusting your filters or selecting a different fuel
                type to reveal more locations.
              </p>
            </div>
          </Show>
        </div>
      </div>
    </Show>
  );
};



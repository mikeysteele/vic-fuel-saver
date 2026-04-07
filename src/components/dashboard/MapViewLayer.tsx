import FuelMap from "../map/FuelMap.tsx";
import type { FuelMetricsAggregate, FuelMetricStat, FuelPriceDetail, Location } from "../../types/fuel.ts";
import type { MapBounds } from "../../primitives/createFuelFilters.ts";

interface MapViewLayerProps {
  viewMode: () => "map" | "list";
  stations: FuelPriceDetail[];
  userLocation: Location | null;
  selectedFuelTypes: string[];
  brandMap: Record<string, string>;
  onViewportChange: (bounds: MapBounds) => void;
  stateMetrics: Record<string, FuelMetricsAggregate>;
  areaMetrics: Record<string, FuelMetricsAggregate>;
  mapFocus: FuelMetricStat | null;
  isDark: boolean;
}

const MapViewLayer = (props: MapViewLayerProps) => {
  return (
    <div
      class={props.viewMode() === "list"
        ? "hidden"
        : "absolute inset-0 z-0 bg-slate-100 dark:bg-slate-900"}
    >
      <FuelMap
        stations={props.stations}
        userLocation={props.userLocation}
        selectedFuelTypes={props.selectedFuelTypes}
        brandMap={props.brandMap}
        onViewportChange={props.onViewportChange}
        stateMetrics={props.stateMetrics}
        areaMetrics={props.areaMetrics}
        mapFocus={props.mapFocus}
        isDark={props.isDark}
      />
    </div>
  );
};

export default MapViewLayer;

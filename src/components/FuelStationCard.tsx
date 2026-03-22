import type { Component } from "solid-js";
import type {
  FuelMetricsAggregate,
  FuelPrice,
  FuelStation,
} from "../types/fuel.ts";
import PriceList from "./station/PriceList.tsx";
import StationAddress from "./station/StationAddress.tsx";
import StationHeader from "./station/StationHeader.tsx";

export interface FuelStationCardProps {
  station: FuelStation;
  prices: FuelPrice[];
  selectedFuelTypes?: string[];
  brandMap: Record<string, string>;
  stateMetrics?: Record<string, FuelMetricsAggregate>;
  areaMetrics?: Record<string, FuelMetricsAggregate>;
}

const FuelStationCard: Component<FuelStationCardProps> = (props) => {
  const displayedPrices = () => {
    if (props.selectedFuelTypes && props.selectedFuelTypes.length > 0) {
      return props.prices.filter((p) =>
        props.selectedFuelTypes!.includes(p.fuelType)
      );
    }
    return props.prices;
  };

  return (
    <div class="group relative flex flex-col border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-8 transition-all duration-500 overflow-hidden w-full bg-white/80 dark:bg-white/[0.03] backdrop-blur-md hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgb(249,115,22,0.15)] hover:border-orange-500/30 hover:bg-white dark:hover:bg-white/[0.05]">
      {/* Decorative glare effect on hover */}
      <div class="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/50 dark:via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -translate-x-full group-hover:translate-x-full ease-out">
      </div>

      <StationHeader
        name={props.station.name}
        brandId={props.brandMap[props.station.brandId] || "Fuel"}
      />
      <StationAddress
        address={{
          addressLine1: props.station.address,
          suburb: props.station.suburb,
          state: props.station.state,
          postcode: props.station.postcode,
        }}
      />
      <div class="px-6 py-4 flex-1">
        <PriceList
          prices={displayedPrices()}
          stateMetrics={props.stateMetrics}
          areaMetrics={props.areaMetrics}
        />
      </div>
    </div>
  );
};

export default FuelStationCard;

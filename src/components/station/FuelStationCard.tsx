import { createSignal } from "solid-js";
import type {
  FuelMetricsAggregate,
  FuelPrice,
  FuelStation,
} from "~/features/fuel/types.ts";
import { PriceList } from "./PriceList.tsx";
import { StationAddress } from "./StationAddress.tsx";
import { StationHeader } from "./StationHeader.tsx";
import { Modal } from "../ui/Modal.tsx";
import { StationHistoryView } from "./StationHistoryView.tsx";

export interface FuelStationCardProps {
  station: FuelStation;
  prices: FuelPrice[];
  selectedFuelTypes?: string[];
  brandMap: Record<string, string>;
  stateMetrics?: Record<string, FuelMetricsAggregate>;
  areaMetrics?: Record<string, FuelMetricsAggregate>;
}

export function FuelStationCard(props: FuelStationCardProps) {
  const [showHistory, setShowHistory] = createSignal(false);

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
      <div class="px-6 pb-6 pt-2">
        <button
          type="button"
          onClick={() => setShowHistory(true)}
          class="w-full py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 3v18h18" />
            <path d="m19 9-5 5-4-4-3 3" />
          </svg>
          View Price History
        </button>
      </div>

      <Modal isOpen={showHistory()} onClose={() => setShowHistory(false)}>
        <StationHistoryView
          stationId={props.station.id}
          stationName={props.station.name}
        />
      </Modal>
    </div>
  );
}

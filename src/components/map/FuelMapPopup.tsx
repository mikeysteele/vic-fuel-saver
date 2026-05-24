import { onMount, createSignal } from "solid-js";
import { TrendingUp } from "lucide-solid";
import type { FuelMetricsAggregate, FuelPrice, FuelStation } from "~/features/fuel/types.ts";
import { Modal } from "~/components/ui/Modal.tsx";
import { StationHistoryView } from "~/components/station/StationHistoryView.tsx";
import { FuelMapPopupHeader } from "./FuelMapPopupHeader.tsx";
import { FuelMapPopupPriceList } from "./FuelMapPopupPriceList.tsx";

export interface FuelMapPopupProps {
  station: FuelStation;
  prices: FuelPrice[];
  selectedFuelTypes?: string[];
  brandMap: Record<string, string>;
  stateMetrics?: Record<string, FuelMetricsAggregate>;
  areaMetrics?: Record<string, FuelMetricsAggregate>;
}

export function FuelMapPopup(props: FuelMapPopupProps) {
  const [showHistory, setShowHistory] = createSignal(false);
  let popupRef!: HTMLDivElement;

  const displayedPrices = () => {
    if (props.selectedFuelTypes && props.selectedFuelTypes.length > 0) {
      return props.prices.filter((p) =>
        props.selectedFuelTypes!.includes(p.fuelType)
      );
    }
    return props.prices; // Default to all if none selected
  };

  onMount(() => {
    //scroll the viewport so the popup is in the centre of it
    popupRef.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
  });

  return (
    <div ref={popupRef} class="flex flex-col w-[260px] bg-white dark:bg-slate-950 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10">
      <FuelMapPopupHeader station={props.station} brandMap={props.brandMap} />
      <FuelMapPopupPriceList prices={displayedPrices()} stateMetrics={props.stateMetrics} areaMetrics={props.areaMetrics} />

      <div class="p-2 pt-0">
        <button
          type="button"
          onClick={() => setShowHistory(true)}
          class="w-full py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center gap-1.5"
        >
          <TrendingUp size={12} />
          View Price History
        </button>
      </div>

      <Modal isOpen={showHistory()} onClose={() => setShowHistory(false)}>
        <StationHistoryView stationId={props.station.id} stationName={props.station.name} />
      </Modal>
    </div>
  );
}



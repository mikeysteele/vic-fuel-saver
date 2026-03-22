import { For, onMount, Show } from "solid-js";
import { getBrandLogoUrl } from "~/lib/brandLogo.ts";
import { ArrowDownRight, ArrowUpRight, TrendingUp, TrendingDown, Minus } from 'lucide-solid';
import type {
  FuelMetricsAggregate,
  FuelPrice,
  FuelStation,
} from "~/types/fuel.ts";

export interface FuelMapPopupProps {
  station: FuelStation;
  prices: FuelPrice[];
  selectedFuelTypes?: string[];
  brandMap: Record<string, string>;
  stateMetrics?: Record<string, FuelMetricsAggregate>;
  areaMetrics?: Record<string, FuelMetricsAggregate>;
}

interface BadgeProps {
  diff: number;
  label: "Area" | "State";
}

const Badge = (props: BadgeProps) => (
  <div
    class={`flex flex-row items-center text-[12px] font-extrabold px-1 py-[1.5px] rounded border w-[88px] text-center leading-none shadow-sm ${props.diff! < 0
      ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/50 dark:border-emerald-500/20"
      : "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200/50 dark:border-rose-500/20"
      }`}
  >
    {Math.abs(props.diff!).toFixed(1)}¢{" "}
    <span>{props.diff! < 0 ? <ArrowDownRight size={10} /> : <ArrowUpRight size={10} />}</span> {props.label}
  </div>)

function FuelMapPopup(props: FuelMapPopupProps) {
  let popupRef!: HTMLDivElement;
  const displayedPrices = () => {
    if (props.selectedFuelTypes && props.selectedFuelTypes.length > 0) {
      return props.prices.filter((p) =>
        props.selectedFuelTypes!.includes(p.fuelType)
      );
    }
    return props.prices; // Default to all if none selected
  };

  const brandName = () => props.brandMap[props.station.brandId] || "Fuel";
  const logoUrl = () => getBrandLogoUrl(brandName(), 32);
  onMount(() => {
    //scroll the viewport so the popup is in the centre of it
    popupRef.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
  });
  return (
    <div ref={popupRef} class="flex flex-col w-[260px] bg-white dark:bg-slate-950 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10">
      {/* Header */}
      <div class="p-3 border-b border-slate-100 dark:border-white/5 flex items-center gap-2.5 bg-slate-50 dark:bg-slate-900/40">
        <Show when={logoUrl()}>
          <img
            src={logoUrl()!}
            class="w-6 h-6 object-contain shrink-0 bg-white rounded-full border border-slate-100 dark:border-slate-800 p-0.5"
          />
        </Show>
        <div class="flex flex-col overflow-hidden">
          <span class="font-bold text-sm text-slate-900 dark:text-white leading-tight truncate">
            {props.station.name}
          </span>
          <span class="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
            {props.station.address}, {props.station.suburb}
          </span>
        </div>
      </div>

      {/* Compact Prices List */}
      <div class="p-2 flex flex-col gap-2 max-h-[256px] overflow-y-auto w-full">
        <For each={displayedPrices()}>
          {(priceEntry) => {
            const isAvailable = priceEntry.isAvailable;
            const stateAvg = () => props.stateMetrics?.[priceEntry.fuelType]?.avg;
            const stateDiff = () => {
              const avg = stateAvg();
              return avg && isAvailable && priceEntry.price > 0
                ? priceEntry.price - avg
                : null;
            };

            const areaAvg = () => props.areaMetrics?.[priceEntry.fuelType]?.avg;
            const areaDiff = () => {
              const avg = areaAvg();
              return avg && isAvailable && priceEntry.price > 0
                ? priceEntry.price - avg
                : null;
            };

            return (
              <div class="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-bold text-slate-700 dark:text-slate-300 w-[2.2rem]">
                    {priceEntry.fuelType}
                  </span>
                  <div
                    class={`h-1.5 w-1.5 rounded-full ${isAvailable ? "bg-emerald-400" : "bg-slate-600"
                      }`}
                  >
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <Show
                    when={isAvailable && priceEntry.price > 0}
                    fallback={
                      <span class="text-xs font-semibold text-slate-400">
                        N/A
                      </span>
                    }
                  >
                    <div class="flex flex-col items-end mr-1">
                      <span class="text-base font-black tracking-tight text-slate-900 dark:text-white leading-none flex items-center">
                        {priceEntry.price.toFixed(1)}{" "}
                        <span class="text-[10px] text-slate-500 font-bold ml-px">
                          ¢
                        </span>
                        <Show when={priceEntry.trend === "up"}>
                          <TrendingUp class="w-3.5 h-3.5 text-rose-500 ml-1.5 drop-shadow-sm" />
                        </Show>
                        <Show when={priceEntry.trend === "down"}>
                          <TrendingDown class="w-3.5 h-3.5 text-emerald-500 ml-1.5 drop-shadow-sm" />
                        </Show>
                        <Show when={priceEntry.trend === "flat"}>
                          <Minus class="w-3 h-3 text-slate-300 dark:text-slate-600 ml-1.5" />
                        </Show>
                      </span>
                    </div>
                  </Show>

                  {/* Comparative Margin Badges Stack */}
                  <div class="flex flex-col items-end gap-[2px]">
                    <Show
                      when={stateDiff() !== null && Math.abs(stateDiff()!) > 0.5}
                      fallback={
                        <span class="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-[1.5px] rounded w-[60px] text-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]">
                          State Avg
                        </span>
                      }
                    >
                      <Badge diff={stateDiff()!} label="State" />
                    </Show>
                    <Show
                      when={areaDiff() !== null && Math.abs(areaDiff()!) > 0.5}
                      fallback={
                        <span class="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-[1.5px] rounded w-[60px] text-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]">
                          Area Avg
                        </span>
                      }
                    >
                      <Badge diff={areaDiff()!} label="Area" />

                    </Show>
                  </div>
                </div>
              </div>
            );
          }}
        </For>
        <Show when={displayedPrices().length === 0}>
          <div class="text-[10px] text-center text-slate-500 py-1">
            No prices found.
          </div>
        </Show>
      </div>
    </div>
  );
};

export default FuelMapPopup;

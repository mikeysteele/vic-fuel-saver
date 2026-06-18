import { Show } from "solid-js";
import { Label } from "../ui/Label.tsx";
import { PriceBadge } from "../ui/PriceBadge.tsx";
import { SelectButton } from "../ui/SelectButton.tsx";
import { Minus, TrendingDown, TrendingUp } from "lucide-solid";
import type { FuelMetricsAggregate, FuelPrice } from "~/features/fuel/types.ts";

interface PriceItemProps {
  priceEntry: FuelPrice;
  stateMetrics?: Record<string, FuelMetricsAggregate>;
  areaMetrics?: Record<string, FuelMetricsAggregate>;
}

/**
 * Dumb component: renders a single fuel price row with comparison badges.
 * No state, no side-effects — all values derived from props.
 */
export function PriceItem(props: PriceItemProps) {
  const isAvailable = () => props.priceEntry.isAvailable;

  const stateDiff = () => {
    if (!props.stateMetrics || !isAvailable() || props.priceEntry.price <= 0) {
      return null;
    }
    const avg = props.stateMetrics[props.priceEntry.fuelType]?.avg;
    return avg ? props.priceEntry.price - avg : null;
  };

  const areaDiff = () => {
    if (!props.areaMetrics || !isAvailable() || props.priceEntry.price <= 0) {
      return null;
    }
    const avg = props.areaMetrics[props.priceEntry.fuelType]?.avg;
    return avg ? props.priceEntry.price - avg : null;
  };

  const diffIntent = (diff: number | null): "below" | "above" | "neutral" => {
    if (diff === null) return "neutral";
    if (diff < -0.5) return "below";
    if (diff > 0.5) return "above";
    return "neutral";
  };

  const ChevronDown = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
  const ChevronUp = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="m18 15-6-6-6 6" />
    </svg>
  );

  return (
    <SelectButton
      intent="standard"
      class="!h-auto p-4 flex items-center justify-between group/item relative overflow-hidden"
    >
      <div class="flex flex-col gap-1.5 text-left">
        <div class="flex items-center gap-2">
          <Label intent="neutral" size="sm">
            {props.priceEntry.fuelType}
          </Label>
          <div
            class={`h-2 w-2 rounded-full ${
              isAvailable()
                ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse"
                : "bg-slate-600"
            }`}
          />
        </div>
      </div>

      <div class="text-right z-10 flex flex-col items-end">
        <Show
          when={isAvailable()}
          fallback={
            <span class="text-lg font-medium text-slate-400 dark:text-slate-600">
              N/A
            </span>
          }
        >
          <div class="flex items-baseline gap-1">
            <span class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {props.priceEntry.price}
            </span>
            <span class="text-sm font-bold text-slate-500 dark:text-slate-400">
              ¢
            </span>
            <span class="ml-1 flex items-center self-center">
              <Show when={props.priceEntry.trend === "up"}>
                <TrendingUp class="w-5 h-5 text-rose-500 drop-shadow-sm" />
              </Show>
              <Show when={props.priceEntry.trend === "down"}>
                <TrendingDown class="w-5 h-5 text-emerald-500 drop-shadow-sm" />
              </Show>
              <Show when={props.priceEntry.trend === "flat"}>
                <Minus class="w-4 h-4 text-slate-300 dark:text-slate-600" />
              </Show>
            </span>
          </div>

          <div class="flex flex-col gap-[2px] mt-1 items-end">
            <Show when={stateDiff() !== null}>
              <PriceBadge intent={diffIntent(stateDiff())}>
                {stateDiff()! < -0.5 && <ChevronDown />}
                {stateDiff()! > 0.5 && <ChevronUp />}
                {stateDiff()! < -0.5
                  ? `${Math.abs(stateDiff()!).toFixed(1)}¢ below State`
                  : stateDiff()! > 0.5
                  ? `${stateDiff()!.toFixed(1)}¢ above State`
                  : "State Average"}
              </PriceBadge>
            </Show>
            <Show when={areaDiff() !== null}>
              <PriceBadge
                intent={diffIntent(areaDiff())}
                class="shadow-sm"
              >
                {areaDiff()! < -0.5 && <ChevronDown />}
                {areaDiff()! > 0.5 && <ChevronUp />}
                {areaDiff()! < -0.5
                  ? `${Math.abs(areaDiff()!).toFixed(1)}¢ below Area`
                  : areaDiff()! > 0.5
                  ? `${areaDiff()!.toFixed(1)}¢ above Area`
                  : "Area Average"}
              </PriceBadge>
            </Show>
          </div>
        </Show>
      </div>
    </SelectButton>
  );
}

import { For, Show } from "solid-js";
import type {
  FuelMetricsAggregate,
  FuelMetricStat,
} from "~/features/fuel/types.ts";
import { Badge } from "../ui/Badge.tsx";
import { MetricCard } from "../ui/MetricCard.tsx";

interface FuelMetricsProps {
  selectedFuelTypes?: string[];
  stateMetrics?: Record<string, FuelMetricsAggregate>;
  areaMetrics?: Record<string, FuelMetricsAggregate>;
  onFocusStation?: (stat: FuelMetricStat) => void;
}

export function FuelMetrics(props: FuelMetricsProps) {
  const getMetrics = (fType: string) => {
    const stateData = () => props.stateMetrics?.[fType];
    const areaData = () => props.areaMetrics?.[fType];
    if (!stateData() && !areaData()) return null;
    return { state: stateData, area: areaData };
  };

  const handleClick = (stat?: FuelMetricStat | null) => {
    if (stat && props.onFocusStation) {
      props.onFocusStation(stat);
    }
  };

  return (
    <div class="flex flex-col gap-4 w-full">
      <For each={props.selectedFuelTypes || []}>
        {(fType) => {
          const m = getMetrics(fType);
          if (!m) return null;

          return (
            <div class="flex flex-col gap-1.5 w-full">
              <div class="flex items-center gap-2 px-2">
                <Badge intent="dark" size="sm">
                  {fType}
                </Badge>
                <div class="h-px bg-slate-300 dark:bg-slate-700 flex-1"></div>
              </div>
              <div class="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 shadow-sm w-full">
                {/* Cheapest Card */}
                <MetricCard intent="cheap" label="Cheapest">
                  <Show when={m.area()?.min}>
                    <div
                      class="flex items-center justify-between cursor-pointer hover:bg-teal-50 dark:hover:bg-teal-900/40 p-1.5 -m-1.5 rounded-lg transition-colors group"
                      onClick={() => handleClick(m.area()?.min)}
                    >
                      <span class="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        Area
                      </span>
                      <div class="flex items-baseline gap-0.5">
                        <p class="text-base sm:text-lg font-black text-teal-700 dark:text-teal-300 leading-none group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          {m.area()!.min!.price.toFixed(1)}
                        </p>
                        <span class="text-[10px] font-bold text-teal-600/70 dark:text-teal-400/70 leading-none">
                          ¢
                        </span>
                      </div>
                    </div>
                  </Show>
                  <Show when={m.state()?.min}>
                    <div
                      class="flex items-center justify-between cursor-pointer hover:bg-teal-50 dark:hover:bg-teal-900/40 p-1.5 -m-1.5 rounded-lg transition-colors group"
                      onClick={() => handleClick(m.state()?.min)}
                    >
                      <span class="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        State
                      </span>
                      <div class="flex items-baseline gap-0.5">
                        <p class="text-base sm:text-lg font-black text-teal-700 dark:text-teal-300 leading-none group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          {m.state()!.min!.price.toFixed(1)}
                        </p>
                        <span class="text-[10px] font-bold text-teal-600/70 dark:text-teal-400/70 leading-none">
                          ¢
                        </span>
                      </div>
                    </div>
                  </Show>
                </MetricCard>

                {/* Average Card */}
                <MetricCard intent="avg" label="Average">
                  <Show when={m.area()?.avg !== undefined}>
                    <div class="flex items-center justify-between p-1.5 -m-1.5 rounded-lg">
                      <span class="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Area
                      </span>
                      <div class="flex items-baseline gap-0.5">
                        <p class="text-lg font-black text-orange-700 dark:text-orange-300 leading-none">
                          {m.area()!.avg.toFixed(1)}
                        </p>
                        <span class="text-[10px] font-bold text-orange-600/70 dark:text-orange-400/70 leading-none">
                          ¢
                        </span>
                      </div>
                    </div>
                  </Show>
                  <Show when={m.state()?.avg !== undefined}>
                    <div class="flex items-center justify-between p-1.5 -m-1.5 rounded-lg">
                      <span class="text-xs font-medium text-slate-500 dark:text-slate-400">
                        State
                      </span>
                      <div class="flex items-baseline gap-0.5">
                        <p class="text-lg font-black text-orange-700 dark:text-orange-300 leading-none">
                          {m.state()!.avg.toFixed(1)}
                        </p>
                        <span class="text-[10px] font-bold text-orange-600/70 dark:text-orange-400/70 leading-none">
                          ¢
                        </span>
                      </div>
                    </div>
                  </Show>
                </MetricCard>

                {/* Highest Card */}
                <MetricCard intent="expensive" label="Highest">
                  <Show when={m.area()?.max}>
                    <div
                      class="flex items-center justify-between cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-900/40 p-1.5 -m-1.5 rounded-lg transition-colors group"
                      onClick={() => handleClick(m.area()?.max)}
                    >
                      <span class="text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                        Area
                      </span>
                      <div class="flex items-baseline gap-0.5">
                        <p class="text-lg font-black text-rose-700 dark:text-rose-300 leading-none group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                          {m.area()!.max!.price.toFixed(1)}
                        </p>
                        <span class="text-[10px] font-bold text-rose-600/70 dark:text-rose-400/70 leading-none">
                          ¢
                        </span>
                      </div>
                    </div>
                  </Show>
                  <Show when={m.state()?.max}>
                    <div
                      class="flex items-center justify-between cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-900/40 p-1.5 -m-1.5 rounded-lg transition-colors group"
                      onClick={() => handleClick(m.state()?.max)}
                    >
                      <span class="text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                        State
                      </span>
                      <div class="flex items-baseline gap-0.5">
                        <p class="text-lg font-black text-rose-700 dark:text-rose-300 leading-none group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                          {m.state()!.max!.price.toFixed(1)}
                        </p>
                        <span class="text-[10px] font-bold text-rose-600/70 dark:text-rose-400/70 leading-none">
                          ¢
                        </span>
                      </div>
                    </div>
                  </Show>
                </MetricCard>
              </div>
            </div>
          );
        }}
      </For>
    </div>
  );
}

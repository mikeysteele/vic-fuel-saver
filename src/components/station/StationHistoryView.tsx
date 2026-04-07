import { createResource, For, Show, createMemo } from "solid-js";
import { getStationPriceHistory } from "~/server/history.ts";
import { PriceBadge } from "~/design-system/components/PriceBadge.tsx";
import { SVGLineChart } from "~/components/ui/SVGLineChart.tsx";
import { SVGBarChart } from "~/components/ui/SVGBarChart.tsx";

export interface StationHistoryViewProps {
  stationId: string;
  stationName: string;
}

const formatDateTime = (isoString?: string | null) => {
  if (!isoString) return "Unknown";
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("en-AU", {
      day: "numeric", month: "short", hour: "numeric", minute: "2-digit"
    }).format(d);
  } catch (_e) {
    return isoString;
  }
};

function StationHistoryView(props: StationHistoryViewProps) {
  const [history] = createResource(
    () => props.stationId,
    async (stationId) => await getStationPriceHistory({ data: { stationId, limit: 100 } })
  );

  const groupedHistory = createMemo(() => {
    if (history.error) return {};
    const data = history();
    if (!data) return {};

    // Group by fuelType
    return data.reduce((acc: Record<string, typeof data>, item: NonNullable<typeof data>[0]) => {
      if (!acc[item.fuelType]) {
        acc[item.fuelType] = [];
      }
      
      const list = acc[item.fuelType];
      if (list.length > 0 && list[list.length - 1].price === item.price) {
        // Collapse consecutive identical prices into a single entry
        // By replacing the last item, we keep the older timestamp as the origin of this price period
        list[list.length - 1] = item;
      } else {
        list.push(item);
      }
      
      return acc;
    }, {});
  });

  const stats = createMemo(() => {
    const groups = groupedHistory();
    const res: Record<string, { min: number, max: number, avg: number, weekdays: { label: string, value: number }[] }> = {};
    for (const [fuelType, records] of Object.entries(groups)) {
      if (records.length === 0) continue;
      
      let sum = 0;
      let min = Infinity;
      let max = -Infinity;
      const daySums = [0,0,0,0,0,0,0];
      const dayCounts = [0,0,0,0,0,0,0];
      
      for (const r of records) {
        if (r.price < min) min = r.price;
        if (r.price > max) max = r.price;
        sum += r.price;
        const day = new Date(r.updatedAt).getDay();
        if (!isNaN(day)) {
          daySums[day] += r.price;
          dayCounts[day]++;
        }
      }
      
      const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      res[fuelType] = {
        min: min === Infinity ? 0 : min,
        max: max === -Infinity ? 0 : max,
        avg: sum / records.length,
        weekdays: dayLabels.map((label, i) => ({
          label,
          value: dayCounts[i] ? daySums[i] / dayCounts[i] : 0
        })).filter(d => d.value > 0) // only show days we have data for
      };
    }
    return res;
  });

  return (
    <div class="flex flex-col h-full space-y-6">
      <div class="space-y-1">
        <h3 class="text-2xl font-bold text-slate-900 dark:text-white">
          {props.stationName}
        </h3>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Price History
        </p>
      </div>

      <Show when={history.loading}>
        <div class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </Show>

      <Show when={history.error}>
        <div class="text-red-500 p-4 bg-red-50 dark:bg-red-500/10 rounded-lg text-sm">
          Failed to load history.
        </div>
      </Show>

      <Show when={!history.loading && !history.error && history()?.length === 0}>
        <div class="text-slate-500 dark:text-slate-400 py-8 text-center bg-slate-50 dark:bg-white/5 rounded-xl border border-dashed border-slate-200 dark:border-white/10">
          No history available for this station yet.
        </div>
      </Show>

      <Show when={history() && history()!.length > 0}>
        <div class="flex-1 overflow-y-auto pr-2 space-y-8 pb-10">
          <For each={Object.entries(groupedHistory())}>
            {([fuelType, records]) => (
              <div class="bg-slate-50 dark:bg-white/5 rounded-2xl p-5 border border-slate-200 dark:border-white/10">
                <div class="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-200 dark:border-white/10">
                  <div class="text-xs font-black px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300 rounded uppercase tracking-wider">
                    {fuelType}
                  </div>
                  <div class="text-sm text-slate-500 dark:text-slate-400 font-medium">History & Stats</div>
                </div>

                {/* Stats Grid */}
                <Show when={stats()[fuelType]}>
                  <div class="grid grid-cols-3 gap-3 mb-6">
                    <div class="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-white/5">
                      <div class="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Average</div>
                      <div class="text-lg font-black text-slate-900 dark:text-white">{stats()[fuelType].avg.toFixed(1)} ¢</div>
                    </div>
                    <div class="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-3 border border-emerald-200/50 dark:border-emerald-500/20">
                      <div class="text-[10px] text-emerald-600 uppercase tracking-widest font-bold mb-1">Cheapest</div>
                      <div class="text-lg font-black text-emerald-700 dark:text-emerald-400">{stats()[fuelType].min.toFixed(1)} ¢</div>
                    </div>
                    <div class="bg-rose-50 dark:bg-rose-500/10 rounded-xl p-3 border border-rose-200/50 dark:border-rose-500/20">
                      <div class="text-[10px] text-rose-600 uppercase tracking-widest font-bold mb-1">Most Exp.</div>
                      <div class="text-lg font-black text-rose-700 dark:text-rose-400">{stats()[fuelType].max.toFixed(1)} ¢</div>
                    </div>
                  </div>
                  
                  {/* Line Chart */}
                  <div class="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-white/5 mb-6">
                    <div class="text-xs font-bold text-slate-500 dark:text-slate-400 mb-4">Price Timeline (Newest ← Oldest)</div>
                    <SVGLineChart 
                      data={records.map(r => r.price)} 
                      labels={records.map(r => formatDateTime(r.updatedAt))}
                      height={100}
                    />
                  </div>

                  {/* Weekday Bar Chart */}
                  <div class="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-white/5 mb-6">
                    <div class="text-xs font-bold text-slate-500 dark:text-slate-400 mb-4">Average by Weekday</div>
                    <SVGBarChart 
                      data={stats()[fuelType].weekdays} 
                      height={100}
                    />
                  </div>
                </Show>

                <div class="space-y-3">
                  <div class="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 px-1">Raw History Log</div>
                  <For each={records}>
                    {(record) => (
                      <div class="flex items-center justify-between group py-1">
                        <div class="flex items-center space-x-4">
                          <div class="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 group-hover:bg-orange-400 transition-colors"></div>
                          <span class="text-sm text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                            {formatDateTime(record.updatedAt)}
                          </span>
                        </div>
                        <div class="font-bold text-lg text-slate-900 dark:text-white">
                          <PriceBadge>{record.price.toFixed(1)} ¢</PriceBadge>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};

export default StationHistoryView;

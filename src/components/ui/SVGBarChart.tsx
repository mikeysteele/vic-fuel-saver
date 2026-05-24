import { For } from "solid-js";

export interface SVGBarChartProps {
  data: { label: string; value: number }[];
  height?: number;
  barColor?: string;
}

export function SVGBarChart(props: SVGBarChartProps) {
  const height = () => props.height || 120;
  
  const maxValue = () => Math.max(...props.data.map(d => d.value), 0.1); // Avoid div by zero
  const viewBox = () => `0 0 100 100`;

  return (
    <div class="w-full relative" style={{ height: `${height()}px` }}>
      <svg
        viewBox={viewBox()}
        preserveAspectRatio="none"
        class="w-full h-full overflow-visible"
      >
        <For each={props.data}>
          {(d, i) => {
            const barWidth = 100 / props.data.length;
            const x = i() * barWidth;
            const h = (d.value / maxValue()) * 100;
            const y = 100 - h;
            // Leave a small gap between bars
            const gap = 2;

            return (
              <g class="group">
                <rect
                  x={x + gap / 2}
                  y={y}
                  width={Math.max(barWidth - gap, 1)}
                  height={h}
                  class={props.barColor || "fill-orange-400 dark:fill-orange-500"}
                  rx="1"
                />
                <title>{d.label}: {d.value.toFixed(1)}</title>
              </g>
            );
          }}
        </For>
      </svg>
      {/* Labels below */}
      <div class="flex justify-between w-full mt-2 absolute top-full left-0">
        <For each={props.data}>
          {(d) => (
            <div class="flex-1 text-center text-[10px] text-slate-500 dark:text-slate-400 truncate">
              {d.label}
            </div>
          )}
        </For>
      </div>
    </div>
  );
}

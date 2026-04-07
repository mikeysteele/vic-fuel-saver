import { createMemo, For } from "solid-js";

export interface SVGLineChartProps {
  data: number[];
  labels?: string[];
  height?: number;
  lineColor?: string;
}

export function SVGLineChart(props: SVGLineChartProps) {
  const height = () => props.height || 100;

  const minVal = createMemo(() => Math.min(...props.data));
  const maxVal = createMemo(() => Math.max(...props.data));
  const range = createMemo(() => Math.max(maxVal() - minVal(), 1));

  const points = createMemo(() => {
    if (props.data.length === 0) return "";
    if (props.data.length === 1) return `0,50 100,50`;

    const stepX = 100 / (props.data.length - 1);
    return props.data
      .map((val, i) => {
        const x = i * stepX;
        // Padding top and bottom (20% above, 20% below)
        const paddedMin = minVal() - range() * 0.2;
        const paddedMax = maxVal() + range() * 0.2;
        const paddedRange = paddedMax - paddedMin;
        
        const y = 100 - ((val - paddedMin) / paddedRange) * 100;
        return `${x},${y}`;
      })
      .join(" ");
  });

  return (
    <div class="w-full relative" style={{ height: `${height()}px` }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        class="w-full h-full overflow-visible"
      >
        {/* Draw line */}
        <polyline
          points={points()}
          fill="none"
          stroke={props.lineColor || "currentColor"}
          class="text-orange-500"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        
        {/* Data points for hover logic */}
        <For each={props.data}>
          {(val, i) => {
            if (props.data.length < 2) return null;
            const stepX = 100 / (props.data.length - 1);
            const x = i() * stepX;
            const paddedMin = minVal() - range() * 0.2;
            const paddedMax = maxVal() + range() * 0.2;
            const y = 100 - ((val - paddedMin) / (paddedMax - paddedMin)) * 100;
            
            return (
              <g class="group">
                {/* Invisible larger hover target */}
                <circle cx={x} cy={y} r="6" fill="transparent" />
                <circle 
                  cx={x} 
                  cy={y} 
                  r="1.5" 
                  class={props.lineColor || "fill-orange-500"} 
                />
                <title>{props.labels?.[i()] || val.toFixed(1)}</title>
              </g>
            );
          }}
        </For>
      </svg>
    </div>
  );
}

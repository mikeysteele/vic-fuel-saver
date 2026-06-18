import { createEffect, onCleanup, onMount } from "solid-js";
import { BarChart } from "chartist";
import "chartist/dist/index.css";

export interface SVGBarChartProps {
  data: { label: string; value: number }[];
  height?: number;
  barColor?: string;
}

export function SVGBarChart(props: SVGBarChartProps) {
  let chartRef!: HTMLDivElement;
  let chart: BarChart | undefined;

  onMount(() => {
    chart = new BarChart(chartRef, {
      labels: props.data.map((d) => d.label),
      series: [props.data.map((d) => d.value)],
    }, {
      height: props.height ? `${props.height}px` : "120px",
      chartPadding: { top: 10, right: 10, bottom: 20, left: 10 },
      axisX: { showGrid: false },
      axisY: { showGrid: false, showLabel: false },
    });
  });

  createEffect(() => {
    if (chart) {
      chart.update({
        labels: props.data.map((d) => d.label),
        series: [props.data.map((d) => d.value)],
      });
    }
  });

  onCleanup(() => {
    if (chart) chart.detach();
  });

  return (
    <div class="w-full relative chartist-orange">
      <div ref={chartRef} class="w-full" />
    </div>
  );
}

import { onMount, createEffect, onCleanup } from "solid-js";
import { LineChart } from "chartist";
import "chartist/dist/index.css";

export interface SVGLineChartProps {
  data: number[];
  labels?: string[];
  height?: number;
  lineColor?: string;
}

export function SVGLineChart(props: SVGLineChartProps) {
  let chartRef!: HTMLDivElement;
  let chart: LineChart | undefined;

  onMount(() => {
    chart = new LineChart(chartRef, {
      labels: props.labels || props.data.map(() => ""),
      series: [props.data],
    }, {
      height: props.height ? `${props.height}px` : "100px",
      showPoint: props.data.length < 50, // Hide points if too dense
      showArea: false,
      fullWidth: true,
      chartPadding: { top: 10, right: 10, bottom: 20, left: 10 },
      axisX: { showGrid: false, showLabel: true },
      axisY: { showGrid: false, showLabel: false }
    });
  });

  createEffect(() => {
    if (chart) {
      chart.update({
        labels: props.labels || props.data.map(() => ""),
        series: [props.data],
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

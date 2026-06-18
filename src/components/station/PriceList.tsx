import { For, Show } from "solid-js";
import type { FuelMetricsAggregate, FuelPrice } from "~/features/fuel/types.ts";
import { PriceItem } from "./PriceItem.tsx";

interface PriceListProps {
  prices: FuelPrice[];
  stateMetrics?: Record<string, FuelMetricsAggregate>;
  areaMetrics?: Record<string, FuelMetricsAggregate>;
}

export function PriceList(props: PriceListProps) {
  return (
    <>
      <div class="flex flex-col gap-3">
        <For each={props.prices}>
          {(priceEntry) => (
            <PriceItem
              priceEntry={priceEntry}
              stateMetrics={props.stateMetrics}
              areaMetrics={props.areaMetrics}
            />
          )}
        </For>
      </div>
      <Show when={props.prices.length === 0}>
        <div class="no-prices">No prices available for this selection.</div>
      </Show>
    </>
  );
}

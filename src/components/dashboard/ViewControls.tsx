import { Panel } from "../ui/Panel.tsx";
import { Button } from "../ui/Button.tsx";
import { FuelMetrics } from "./FuelMetrics.tsx";
import type {
  FuelMetricsAggregate,
  FuelMetricStat,
} from "~/features/fuel/types.ts";

interface ViewControlsProps {
  selectedFuelTypes: string[];
  stateMetrics: Record<string, FuelMetricsAggregate>;
  areaMetrics: Record<string, FuelMetricsAggregate>;
  onFocusStation: (stat: FuelMetricStat) => void;
  viewMode: "map" | "list";
  setViewMode: (mode: "map" | "list") => void;
}

export function ViewControls(props: ViewControlsProps) {
  return (
    <div class="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-20 pointer-events-auto flex flex-col gap-3 md:gap-4">
      <FuelMetrics
        selectedFuelTypes={props.selectedFuelTypes}
        stateMetrics={props.stateMetrics}
        areaMetrics={props.areaMetrics}
        onFocusStation={props.onFocusStation}
      />

      {/* View toggle */}
      <div class="flex items-center justify-center">
        <Panel
          intent="glass"
          padding="none"
          class="inline-flex p-1 !rounded-xl"
        >
          <Button
            onClick={() => props.setViewMode("map")}
            intent={props.viewMode === "map"
              ? "viewToggleActive"
              : "viewToggleInactive"}
            size="viewToggle"
            type="button"
          >
            Map View
          </Button>
          <Button
            onClick={() => props.setViewMode("list")}
            intent={props.viewMode === "list"
              ? "viewToggleActive"
              : "viewToggleInactive"}
            size="viewToggle"
            type="button"
          >
            List View
          </Button>
        </Panel>
      </div>
    </div>
  );
}

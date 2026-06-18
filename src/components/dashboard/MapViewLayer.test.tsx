import { render } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import { MapViewLayer } from "./MapViewLayer.tsx";
import type { FuelMetricsAggregate } from "~/features/fuel/types.ts";

// Mock FuelMap because it depends on Leaflet which is hard to test in JSDOM
vi.mock("../map/FuelMap.tsx", () => ({
  FuelMap: () => <div data-testid="mock-fuel-map" />,
}));

describe("MapViewLayer", () => {
  const defaultProps = {
    viewMode: () => "map" as const,
    stations: [],
    userLocation: null,
    selectedFuelTypes: [] as string[],
    brandMap: {} as Record<string, string>,
    onViewportChange: vi.fn(),
    stateMetrics: {} as Record<string, FuelMetricsAggregate>,
    areaMetrics: {} as Record<string, FuelMetricsAggregate>,
    mapFocus: null,
    isDark: false,
  };

  it("renders map container when viewMode is 'map'", () => {
    const { getByTestId, container } = render(() => (
      <MapViewLayer {...defaultProps} />
    ));
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).not.toHaveClass("hidden");
    expect(getByTestId("mock-fuel-map")).toBeInTheDocument();
  });

  it("adds 'hidden' class when viewMode is 'list'", () => {
    const { container } = render(() => (
      <MapViewLayer
        {...defaultProps}
        viewMode={() => "list" as const}
      />
    ));
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("hidden");
  });
});

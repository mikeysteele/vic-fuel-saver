import { render, screen } from "@solidjs/testing-library";
import { describe, it, expect, vi } from "vitest";
import { ListViewLayer } from "./ListViewLayer.tsx";
import type { FuelMetricsAggregate } from "~/features/fuel/types.ts";

// Mock FuelStationCard because it's already tested separately
vi.mock("../station/FuelStationCard.tsx", () => ({
  FuelStationCard: (props: { station: { name: string } }) => <div data-testid="mock-station-card">{props.station.name}</div>
}));

describe("ListViewLayer", () => {
  const mockStation = {
    fuelStation: {
      id: "1",
      name: "Station 1",
      address: "Addr 1",
      suburb: "S1",
      state: "VIC",
      postcode: "3000",
      brandId: "B1",
      location: { latitude: -37, longitude: 144 },
    },
    fuelPrices: [],
    updatedAt: "2024-03-22T00:00:00Z",
  };

  const defaultProps = {
    viewMode: "list" as const,
    stations: [mockStation],
    selectedFuelTypes: [] as string[],
    brandMap: {} as Record<string, string>,
    stateMetrics: {} as Record<string, FuelMetricsAggregate>,
    areaMetrics: {} as Record<string, FuelMetricsAggregate>,
  };

  it("renders a list of station cards when in 'list' viewMode", () => {
    render(() => <ListViewLayer {...defaultProps} />);
    expect(screen.getByTestId("mock-station-card")).toBeInTheDocument();
    expect(screen.getByText("Station 1")).toBeInTheDocument();
  });

  it("renders the empty state when no stations are provided", () => {
    render(() => <ListViewLayer {...defaultProps} stations={[]} />);
    expect(screen.getByText(/No stations found/i)).toBeInTheDocument();
    expect(screen.getByText(/Try adjusting your filters/i)).toBeInTheDocument();
  });

  it("renders nothing when viewMode is 'map'", () => {
    const { container } = render(() => (
      <ListViewLayer {...defaultProps} viewMode="map" />
    ));
    expect(container.firstChild).toBeNull();
  });
});

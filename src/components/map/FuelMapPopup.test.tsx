import { render, screen } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import { FuelMapPopup } from "./FuelMapPopup.tsx";

vi.mock("~/components/station/StationHistoryView.tsx", () => ({
  StationHistoryView: () => <div data-testid="mock-history-view" />,
}));
import type { FuelStation, FuelPrice, FuelMetricsAggregate } from "~/features/fuel/types.ts";

const station: FuelStation = {
  id: "1",
  brandId: "BP001",
  name: "BP Southbank",
  address: "123 Southbank Blvd",
  suburb: "Southbank",
  state: "VIC",
  postcode: "3006",
  location: { latitude: -37.82, longitude: 144.96 },
};

const prices: FuelPrice[] = [
  { fuelType: "U91", price: 175.9, isAvailable: true, updatedAt: "" },
  { fuelType: "P98", price: 199.5, isAvailable: true, updatedAt: "" },
];

const brandMap = { BP001: "BP" };

const stateMetrics: Record<string, FuelMetricsAggregate> = {
  U91: { avg: 180.0, min: null, max: null },
  P98: { avg: 195.0, min: null, max: null },
};

const areaMetrics: Record<string, FuelMetricsAggregate> = {
  U91: { avg: 170.0, min: null, max: null },
  P98: { avg: 205.0, min: null, max: null },
};

describe("FuelMapPopup", () => {
  it("renders station name and address", () => {
    render(() => (
      <FuelMapPopup
        station={station}
        prices={prices}
        brandMap={brandMap}
      />
    ));
    expect(screen.getByText("BP Southbank")).toBeInTheDocument();
    expect(screen.getByText(/123 Southbank Blvd/)).toBeInTheDocument();
  });

  it("renders prices for fuel types", () => {
    render(() => (
      <FuelMapPopup
        station={station}
        prices={prices}
        brandMap={brandMap}
      />
    ));
    expect(screen.getByText("U91")).toBeInTheDocument();
    expect(screen.getByText("175.9")).toBeInTheDocument();
    expect(screen.getByText("P98")).toBeInTheDocument();
    expect(screen.getByText("199.5")).toBeInTheDocument();
  });

  it("filters prices by selectedFuelTypes", () => {
    render(() => (
      <FuelMapPopup
        station={station}
        prices={prices}
        brandMap={brandMap}
        selectedFuelTypes={["U91"]}
      />
    ));
    expect(screen.getByText("U91")).toBeInTheDocument();
    expect(screen.queryByText("P98")).not.toBeInTheDocument();
  });

  it("shows comparison badges when metrics are provided", () => {
    render(() => (
      <FuelMapPopup
        station={station}
        prices={prices}
        brandMap={brandMap}
        stateMetrics={stateMetrics}
        areaMetrics={areaMetrics}
      />
    ));

    // U91: 175.9, State Avg: 180.0 -> 4.1 below State
    expect(screen.getByText(/4.1¢.*State/)).toBeInTheDocument();
    // U91: 175.9, Area Avg: 170.0 -> 5.9 above Area
    expect(screen.getByText(/5.9¢.*Area/)).toBeInTheDocument();
  });

  it("renders correctly without metrics", () => {
    render(() => (
      <FuelMapPopup
        station={station}
        prices={prices}
        brandMap={brandMap}
      />
    ));
    expect(screen.getAllByText("State Avg").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Area Avg").length).toBeGreaterThan(0);
  });
});

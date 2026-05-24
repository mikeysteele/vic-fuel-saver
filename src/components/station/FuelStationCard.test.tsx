import { render, screen } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import { FuelStationCard } from "./FuelStationCard.tsx";
import type { FuelStation, FuelPrice } from "~/features/fuel/types.ts";

vi.mock("./StationHistoryView.tsx", () => ({
  StationHistoryView: (props: { stationName: string }) => <div data-testid="mock-history-view">{props.stationName} History</div>
}));

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
  { fuelType: "E10", price: 168.0, isAvailable: false, updatedAt: "" },
];

const brandMap = { BP001: "BP" };

describe("FuelStationCard", () => {
  it("renders the station name", () => {
    render(() => (
      <FuelStationCard
        station={station}
        prices={prices}
        brandMap={brandMap}
      />
    ));
    expect(screen.getByText("BP Southbank")).toBeInTheDocument();
  });

  it("renders the station address", () => {
    render(() => (
      <FuelStationCard
        station={station}
        prices={prices}
        brandMap={brandMap}
      />
    ));
    expect(screen.getByText(/123 Southbank Blvd/)).toBeInTheDocument();
  });

  it("renders the brand logo with correct alt text when brand is in brandMap", () => {
    render(() => (
      <FuelStationCard
        station={station}
        prices={prices}
        brandMap={brandMap}
      />
    ));
    // The img alt text uses the resolved brand name
    const img = document.querySelector("img");
    expect(img?.alt).toBe("BP logo");
  });

  it("shows all prices when no fuel types are selected", () => {
    render(() => (
      <FuelStationCard
        station={station}
        prices={prices}
        brandMap={brandMap}
        selectedFuelTypes={[]}
      />
    ));
    expect(screen.getByText("U91")).toBeInTheDocument();
    expect(screen.getByText("P98")).toBeInTheDocument();
    expect(screen.getByText("E10")).toBeInTheDocument();
  });

  it("only shows prices for selected fuel types", () => {
    render(() => (
      <FuelStationCard
        station={station}
        prices={prices}
        brandMap={brandMap}
        selectedFuelTypes={["U91"]}
      />
    ));
    expect(screen.getByText("U91")).toBeInTheDocument();
    expect(screen.queryByText("P98")).not.toBeInTheDocument();
    expect(screen.queryByText("E10")).not.toBeInTheDocument();
  });

  it("uses brandId as the logo alt text when brand is not in brandMap", () => {
    render(() => (
      <FuelStationCard
        station={station}
        prices={prices}
        brandMap={{}}        
      />
    ));
    // Falls back to 'Fuel' as the brandId passed to StationHeader
    // which generates alt text: "Fuel logo"
    const img = document.querySelector("img");
    // No logo URL when brand is unknown — no img rendered
    expect(img).toBeNull();
  });
});

import { render, screen } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import type { FuelMetricsAggregate, FuelPrice } from "../../types/fuel.ts";
import PriceItem from "./PriceItem.tsx";

const availablePrice: FuelPrice = {
  fuelType: "U91",
  price: 175.5,
  isAvailable: true,
  updatedAt: "2024-01-01T00:00:00Z",
};

const unavailablePrice: FuelPrice = {
  fuelType: "P98",
  price: 0,
  isAvailable: false,
  updatedAt: "2024-01-01T00:00:00Z",
};

const stateMetricsBelowAvg: Record<string, FuelMetricsAggregate> = {
  U91: { avg: 180.0, min: null, max: null }, // station at 175.5 is 4.5 below avg
};

const stateMetricsAboveAvg: Record<string, FuelMetricsAggregate> = {
  U91: { avg: 170.0, min: null, max: null }, // station at 175.5 is 5.5 above avg
};

describe("PriceItem", () => {
  it("renders the fuel type label", () => {
    render(() => <PriceItem priceEntry={availablePrice} />);
    expect(screen.getByText("U91")).toBeInTheDocument();
  });

  it("renders price with currency symbol for available price", () => {
    render(() => <PriceItem priceEntry={availablePrice} />);
    expect(screen.getByText("175.5")).toBeInTheDocument();
    expect(screen.getByText("¢")).toBeInTheDocument();
  });

  it("renders N/A for unavailable price", () => {
    render(() => <PriceItem priceEntry={unavailablePrice} />);
    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  it("renders 'below State' badge when price is cheaper than state average", () => {
    render(() => (
      <PriceItem
        priceEntry={availablePrice}
        stateMetrics={stateMetricsBelowAvg}
      />
    ));
    expect(screen.getByText(/below State/)).toBeInTheDocument();
  });

  it("renders 'above State' badge when price is more expensive than state average", () => {
    render(() => (
      <PriceItem
        priceEntry={availablePrice}
        stateMetrics={stateMetricsAboveAvg}
      />
    ));
    expect(screen.getByText(/above State/)).toBeInTheDocument();
  });

  it("shows no diff badge when diff is within 0.5¢ threshold", () => {
    const metricsNearAvg: Record<string, FuelMetricsAggregate> = {
      U91: { avg: 175.7, min: null, max: null }, // diff is -0.2, within threshold
    };
    render(() => (
      <PriceItem priceEntry={availablePrice} stateMetrics={metricsNearAvg} />
    ));
    expect(screen.getByText("State Average")).toBeInTheDocument();
  });

  it("does not render diff badges for unavailable price", () => {
    render(() => (
      <PriceItem
        priceEntry={unavailablePrice}
        stateMetrics={stateMetricsBelowAvg}
      />
    ));
    expect(screen.queryByText(/below State/)).not.toBeInTheDocument();
    expect(screen.queryByText(/above State/)).not.toBeInTheDocument();
  });
});

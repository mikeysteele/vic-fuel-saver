import { render, screen, fireEvent } from "@solidjs/testing-library";
import { describe, it, expect, vi } from "vitest";
import ViewControls from "./ViewControls.tsx";
import type { FuelMetricsAggregate } from "../../types/fuel.ts";

// Mock FuelMetrics to avoid testing its internal aggregate rendering
vi.mock("./FuelMetrics.tsx", () => ({
  default: () => <div data-testid="mock-fuel-metrics" />
}));

describe("ViewControls", () => {
  const defaultProps = {
    selectedFuelTypes: [] as string[],
    stateMetrics: {} as Record<string, FuelMetricsAggregate>,
    areaMetrics: {} as Record<string, FuelMetricsAggregate>,
    onFocusStation: vi.fn(),
    viewMode: "map" as const,
    setViewMode: vi.fn(),
  };

  it("renders both view toggle buttons", () => {
    render(() => <ViewControls {...defaultProps} />);
    expect(screen.getByRole("button", { name: /map view/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /list view/i })).toBeInTheDocument();
  });

  it("calls setViewMode when a toggle button is clicked", () => {
    const setViewMode = vi.fn();
    render(() => <ViewControls {...defaultProps} setViewMode={setViewMode} />);
    
    const listBtn = screen.getByRole("button", { name: /list view/i });
    fireEvent.click(listBtn);
    
    expect(setViewMode).toHaveBeenCalledWith("list");
  });

  it("renders metrics through FuelMetrics child component", () => {
    const { getByTestId } = render(() => <ViewControls {...defaultProps} />);
    expect(getByTestId("mock-fuel-metrics")).toBeInTheDocument();
  });
});

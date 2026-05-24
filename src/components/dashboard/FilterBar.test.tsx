import { fireEvent, render, screen } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import { FilterBar } from "./FilterBar.tsx";

const defaultProps = {
  fuelTypes: ["U91", "P95", "P98"],
  brands: ["BP001", "SHELL001"],
  brandMap: { BP001: "BP", SHELL001: "Shell" },
  selectedFuelTypes: [],
  selectedBrandIds: [],
  userLocation: null,
  onFuelTypesChange: vi.fn(),
  onBrandIdsChange: vi.fn(),
  onNearMeClick: vi.fn(),
  isExpanded: true,
  onToggleExpanded: vi.fn(),
};

describe("FilterBar", () => {
  it("renders the Fuel Type label", () => {
    render(() => <FilterBar {...defaultProps} />);
    expect(screen.getByText("Fuel Type")).toBeInTheDocument();
  });

  it("renders the Brand label", () => {
    render(() => <FilterBar {...defaultProps} />);
    expect(screen.getByText("Brand")).toBeInTheDocument();
  });

  it("renders a 'Near Me' button when no user location", () => {
    render(() => <FilterBar {...defaultProps} userLocation={null} />);
    expect(screen.getByText("Near Me")).toBeInTheDocument();
  });

  it("renders a 'Clear' button when user location is set", () => {
    render(() => (
      <FilterBar
        {...defaultProps}
        userLocation={{ latitude: -37.8, longitude: 144.9 }}
      />
    ));
    expect(screen.getByText("Clear")).toBeInTheDocument();
  });

  it("calls onNearMeClick when Near Me button is clicked", () => {
    const onNearMeClick = vi.fn();
    render(() => <FilterBar {...defaultProps} onNearMeClick={onNearMeClick} />);
    fireEvent.click(screen.getByText("Near Me"));
    expect(onNearMeClick).toHaveBeenCalledOnce();
  });

  it("shows active filter count badge when filters are active", () => {
    render(() => (
      <FilterBar
        {...defaultProps}
        selectedFuelTypes={["U91"]}
        selectedBrandIds={["BP001"]}
      />
    ));
    // Active count = 1 fuel type + 1 brand = 2
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("does not show count badge when no filters are active", () => {
    render(() => <FilterBar {...defaultProps} />);
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("calls onToggleExpanded when the mobile filter header is clicked", () => {
    const onToggleExpanded = vi.fn();
    render(() => (
      <FilterBar {...defaultProps} onToggleExpanded={onToggleExpanded} />
    ));
    fireEvent.click(screen.getByText("Filters"));
    expect(onToggleExpanded).toHaveBeenCalledOnce();
  });
});

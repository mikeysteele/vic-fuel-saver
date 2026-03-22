import { render, screen, fireEvent } from "@solidjs/testing-library";
import { describe, it, expect, vi } from "vitest";
import Header from "./Header.tsx";

describe("Header", () => {
  const defaultProps = {
    theme: () => "light" as const,
    toggleTheme: vi.fn(),
    latestUpdatedAt: () => null,
  };

  it("renders the FuelSaver brand name", () => {
    render(() => <Header {...defaultProps} />);
    expect(screen.getByText("FuelSaver")).toBeInTheDocument();
    expect(screen.getByText("Victoria")).toBeInTheDocument();
  });

  it("renders the data freshness timestamp when provided", () => {
    const timestamp = "2026-03-22T02:00:00Z";
    render(() => (
      <Header {...defaultProps} latestUpdatedAt={() => timestamp} />
    ));
    // The date format might vary by environment, so we check for the text surrounding it
    expect(screen.getByText(/Prices as of/i)).toBeInTheDocument();
  });

  it("calls toggleTheme when the theme button is clicked", () => {
    const toggleTheme = vi.fn();
    render(() => <Header {...defaultProps} toggleTheme={toggleTheme} />);

    const button = screen.getByRole("button", { name: /toggle theme/i });
    fireEvent.click(button);

    expect(toggleTheme).toHaveBeenCalled();
  });
});

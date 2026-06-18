import { render, screen } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "solid-js";
import { StationHistoryView } from "./StationHistoryView.tsx";
import { getStationPriceHistory } from "~/server/history.ts";

vi.mock("~/server/history.ts", () => ({
  getStationPriceHistory: vi.fn(),
}));

describe("StationHistoryView", () => {
  it("renders loading state", () => {
    vi.mocked(getStationPriceHistory).mockImplementation(() => new Promise(() => {}));
    
    render(() => (
      <StationHistoryView stationId="123" stationName="Test Station" />
    ));
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders error state", async () => {
    vi.mocked(getStationPriceHistory).mockImplementation(() => Promise.reject(new Error("Failed")));
    
    render(() => (
      <ErrorBoundary fallback={() => <div>Failed to load history.</div>}>
        <StationHistoryView stationId="123" stationName="Test Station" />
      </ErrorBoundary>
    ));
    expect(await screen.findByText("Failed to load history.")).toBeInTheDocument();
  });

  it("renders empty state", async () => {
    vi.mocked(getStationPriceHistory).mockResolvedValue([]);
    
    const { findByText } = render(() => (
      <StationHistoryView stationId="123" stationName="Test Station" />
    ));
    expect(await findByText("No history available for this station yet.")).toBeInTheDocument();
  });

  it("renders history", async () => {
    vi.mocked(getStationPriceHistory).mockResolvedValue([
      { fuelType: "U91", price: 150.5, updatedAt: "1970-01-01T12:00:00Z", stationId: "123", isAvailable: true, priceDate: "1970-01-01", syncedAt: "1970-01-01V12:00:00Z" },
      { fuelType: "U91", price: 151.5, updatedAt: "2026-04-04T00:00:00Z", stationId: "123", isAvailable: true, priceDate: "2026-04-04", syncedAt: "1970-01-01V12:00:00Z" },
    ]);
    
    const { findByText, getAllByText } = render(() => (
      <StationHistoryView stationId="123" stationName="Test Station" />
    ));
    expect(await findByText("U91")).toBeInTheDocument();
    expect(getAllByText("150.5 ¢").length).toBeGreaterThan(0);
    
    vi.mocked(getStationPriceHistory).mockResolvedValue([
      { fuelType: "U91", price: 150.5, updatedAt: "invalid-date", stationId: "123", isAvailable: true, priceDate: "invalid", syncedAt: "1970-01-01T12:00:00Z" },
    ]);
  });
});

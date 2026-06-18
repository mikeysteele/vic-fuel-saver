import { render, waitFor } from "@solidjs/testing-library";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSignal } from "solid-js";
import { FuelMap } from "./FuelMap.tsx";
import type { FuelPriceDetail } from "~/features/fuel/types.ts";

// Mock Leaflet
const mockMap = {
  setView: vi.fn().mockReturnThis(),
  on: vi.fn().mockReturnThis(),
  once: vi.fn().mockReturnThis(),
  addLayer: vi.fn().mockReturnThis(),
  remove: vi.fn().mockReturnThis(),
  getBounds: vi.fn().mockReturnValue({
    getNorth: () => -37.8,
    getSouth: () => -37.9,
    getEast: () => 145.0,
    getWest: () => 144.9,
  }),
};

const mockMarker = {
  bindPopup: vi.fn().mockReturnThis(),
  on: vi.fn().mockReturnThis(),
  addTo: vi.fn().mockReturnThis(),
};

const mockClusterGroup = {
  addLayers: vi.fn().mockReturnThis(),
  removeLayers: vi.fn().mockReturnThis(),
  addTo: vi.fn().mockReturnThis(),
};

const L = {
  map: vi.fn().mockReturnValue(mockMap),
  tileLayer: vi.fn().mockReturnValue({
    addTo: vi.fn().mockReturnThis(),
    remove: vi.fn().mockReturnThis(),
  }),
  markerClusterGroup: vi.fn().mockReturnValue(mockClusterGroup),
  marker: vi.fn().mockReturnValue(mockMarker),
  divIcon: vi.fn().mockReturnValue({}),
  circleMarker: vi.fn().mockReturnValue({
    addTo: vi.fn().mockReturnThis(),
  }),
  Icon: {
    Default: {
      prototype: {},
      mergeOptions: vi.fn(),
    },
  },
};

vi.mock("leaflet", () => ({
  default: L,
}));

vi.mock("leaflet.markercluster", () => ({
  default: {},
}));

// Mock brandLogo and FuelMapPopup to avoid dependencies
vi.mock("~/features/fuel/brandLogo.ts", () => ({
  getBrandLogoUrl: vi.fn().mockReturnValue("mock-logo-url"),
}));

vi.mock("./FuelMapPopup.tsx", () => ({
  FuelMapPopup: () => <div data-testid="mock-popup" />,
}));

const mockStations: FuelPriceDetail[] = [
  {
    fuelStation: {
      id: "1",
      name: "Test Station",
      brandId: "B1",
      location: { latitude: -37.85, longitude: 144.95 },
      address: "123 test",
      suburb: "test",
      state: "VIC",
      postcode: "3000",
    },
    fuelPrices: [],
    updatedAt: "2024-03-22T00:00:00Z",
  },
];

describe("FuelMap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes map and reports initial bounds", async () => {
    const onViewportChange = vi.fn();
    render(() => (
      <FuelMap
        stations={[]}
        userLocation={null}
        brandMap={{}}
        onViewportChange={onViewportChange}
      />
    ));

    await waitFor(() => {
      expect(L.map).toHaveBeenCalled();
    });

    expect(onViewportChange).toHaveBeenCalledWith({
      north: -37.8,
      south: -37.9,
      east: 145.0,
      west: 144.9,
    });
  });

  it("switches tile layers for dark mode", async () => {
    const [isDark, setIsDark] = createSignal(false);
    render(() => (
      <FuelMap
        stations={[]}
        userLocation={null}
        brandMap={{}}
        isDark={isDark()}
      />
    ));

    await waitFor(() => {
      expect(L.tileLayer).toHaveBeenCalledWith(
        expect.stringContaining("openstreetmap.org"),
        expect.anything(),
      );
    });

    setIsDark(true);

    await waitFor(() => {
      expect(L.tileLayer).toHaveBeenCalledWith(
        expect.stringContaining("cartocdn.com/dark_all"),
        expect.anything(),
      );
    });
  });

  it("adds and updates markers when stations change", async () => {
    const [stations, setStations] = createSignal<FuelPriceDetail[]>([]);
    render(() => (
      <FuelMap
        stations={stations()}
        userLocation={null}
        brandMap={{ B1: "TestBrand" }}
      />
    ));

    await waitFor(() => {
      expect(L.markerClusterGroup).toHaveBeenCalled();
    });

    setStations(mockStations);

    await waitFor(() => {
      expect(mockClusterGroup.addLayers).toHaveBeenCalled();
      const addedMarkerCount =
        mockClusterGroup.addLayers.mock.calls[0][0].length;
      expect(addedMarkerCount).toBe(1);
    });

    // Update with empty stations should remove markers
    setStations([]);

    await waitFor(() => {
      expect(mockClusterGroup.removeLayers).toHaveBeenCalled();
    });
  });
});

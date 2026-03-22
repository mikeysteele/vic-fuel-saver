
import type * as LType from "leaflet"; // Type-only import
import { createEffect, createSignal, onCleanup, onMount, createMemo, Show } from "solid-js";
import { render } from "solid-js/web";
import type {
  FuelMetricsAggregate,
  FuelMetricStat,
  FuelPriceDetail,
} from "~/types/fuel.ts";
import type { MapBounds } from "../../primitives/createFuelFilters.ts";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";


import { getBrandLogoUrl } from "~/lib/brandLogo.ts";
import FuelMapPopup from "./FuelMapPopup.tsx";

// Using static assets from public/leaflet/ (copied by vite-plugin-static-copy)
const ICON_URL = "/assets/leaflet/marker-icon.png" as const;
const ICON_RETINA_URL = "/assets/leaflet/marker-icon-2x.png" as const;
const SHADOW_URL = "/assets/leaflet/marker-shadow.png" as const;

interface FuelMapProps {
  stations: FuelPriceDetail[];
  userLocation: { latitude: number; longitude: number } | null;
  selectedFuelTypes?: string[];
  brandMap: Record<string, string>;
  onViewportChange?: (bounds: MapBounds) => void;
  stateMetrics?: Record<string, FuelMetricsAggregate>;
  areaMetrics?: Record<string, FuelMetricsAggregate>;
  mapFocus?: FuelMetricStat | null;
  isDark?: boolean;
}

interface FuelMapMarkerIconProps {
  brand?: string;
  logoUrl?: string;
}

function FuelMapMarkerIcon(props: FuelMapMarkerIconProps) {

  const [showFallback, setShowFallback] = createSignal(!props.logoUrl);

  const imgHtml = props.logoUrl
    ? (
      <img
        src={props.logoUrl}
        style={`display: ${showFallback() ? "none" : "flex"}`}
        class="w-6 h-6 object-contain bg-slate-100 rounded-full shrink-0 shadow-sm border border-slate-300/50 p-[2px]"
        onError={() => setShowFallback(true)}
      />
    )
    : null;

  const fallbackSvgHtml = (
    <div
      style={`display: ${showFallback() ? "flex" : "none"}`}
      class="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 flex items-center justify-center shrink-0 shadow-inner"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="text-slate-500 dark:text-slate-300"
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <path d="M12 20h-4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2Z" />
        <path d="M14 6h-4" />
        <path d="M8 10h-2" />
      </svg>
    </div>
  );

  return (
    <div class="animate-in fade-in duration-500 ease-out absolute left-0 top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold text-xs py-1.5 pl-1.5 pr-3.5 flex items-center gap-2.5 rounded-full shadow-[0_6px_20px_rgba(0,0,0,0.2)] dark:shadow-[0_6px_20px_rgba(0,0,0,0.6)] whitespace-nowrap transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 hover:-translate-y-3/4 hover:shadow-[0_12px_30px_rgba(249,115,22,0.3)] transition-all hover:border-orange-500/50 z-10 cursor-pointer">
      {imgHtml}
      {fallbackSvgHtml}
      <span class="tracking-wide drop-shadow-md leading-none mt-0.5">
        {props.brand}
      </span>
    </div>
  );
}

export default function FuelMap(props: FuelMapProps) {
  let mapContainer!: HTMLDivElement;
  let clusterGroup: LType.MarkerClusterGroup | null = null;
  let map: LType.Map | null = null;
  let tileLayer: LType.TileLayer | null = null;
  const markers = new Map<string, LType.Marker>();
  const [leafletRef, setLeafletRef] = createSignal<typeof LType | null>(null);

  const currentStationsMap = createMemo(() => {
    const map = new Map<string, FuelPriceDetail>();
    for (const s of props.stations) {
      map.set(s.fuelStation.id, s);
    }
    return map;
  });

  onMount(async () => {
    // Dynamically import Leaflet and CSS only in the browser
    const L = (await import("leaflet")).default;
    await import("leaflet/dist/leaflet.css");

    // Import markercluster plugin
    await import("leaflet.markercluster");

    // Fix specific Leaflet bundler issue where it tries to auto-resolve icons using script tags
    // deno-lint-ignore no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: ICON_RETINA_URL,
      iconUrl: ICON_URL,
      shadowUrl: SHADOW_URL,
    });

    map = L.map(mapContainer, { maxZoom: 18 }).setView(
      [-37.8136, 144.9631],
      10,
    );

    // Initialize cluster group
    clusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
    });
    map.addLayer(clusterGroup);

    const updateBounds = () => {
      if (map && props.onViewportChange) {
        const b = map.getBounds();
        props.onViewportChange({
          north: b.getNorth(),
          south: b.getSouth(),
          east: b.getEast(),
          west: b.getWest(),
        });
      }
    };

    map.on("moveend", updateBounds);
    map.on("zoomend", updateBounds);

    // Initial manual bounds
    updateBounds();
    setLeafletRef(() => L);
  });

  // Effect to handle tile layer theme switching
  createEffect(() => {
    const L = leafletRef();
    if (map && L) {
      if (tileLayer) {
        tileLayer.remove();
      }

      const isDark = props.isDark;
      const url = isDark
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

      const attribution = isDark
        ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

      tileLayer = L.tileLayer(url, { attribution, maxZoom: 18 });
      tileLayer.addTo(map);
    }
  });

  // Effect to handle user location centering
  createEffect(() => {
    const L = leafletRef();
    if (map && props.userLocation && L) {
      map.setView(
        [props.userLocation.latitude, props.userLocation.longitude],
        13,
      );

      L.circleMarker(
        [props.userLocation.latitude, props.userLocation.longitude],
        {
          radius: 8,
          fillColor: "#a855f7",
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8,
        },
      ).addTo(map);
    }
  });

  // Effect to handle interactive metric panning
  createEffect(() => {
    const L = leafletRef();
    const focus = props.mapFocus;
    if (map && focus && L && clusterGroup) {
      map.setView([focus.lat, focus.lng], 14, { animate: true });

      // Let animation and subsequent 'moveend' complete before checking markers
      map.once("moveend", () => {
        setTimeout(() => {
          const marker = markers.get(focus.stationId);
          if (marker) {
            // Utilize marker cluster plugin's native unwrapping wrapper
            clusterGroup?.zoomToShowLayer(marker, () => {
              marker.openPopup();
            });
          }
        }, 100);
      });
    }
  });

  // Effect to update station markers
  createEffect(() => {
    const L = leafletRef();
    if (!map || !L || !clusterGroup) return;

    const currentStations = props.stations;

    const newIds = new Set(currentStations.map((s) => s.fuelStation.id));
    const toRemove: LType.Marker[] = [];
    const toAdd: LType.Marker[] = [];

    // Determine which markers are stale
    for (const [id, marker] of markers.entries()) {
      if (!newIds.has(id)) {
        toRemove.push(marker);
        markers.delete(id);
      }
    }

    // Remove in bulk if possible
    if (toRemove.length > 0) {
      clusterGroup.removeLayers(toRemove);
    }

    // Add new markers
    for (const stationDetail of currentStations) {
      const id = stationDetail.fuelStation.id;
      if (!markers.has(id)) {
        const { latitude, longitude } = stationDetail.fuelStation.location;
        const brand = props.brandMap[stationDetail.fuelStation.brandId] ??
          "Fuel";
        const logoUrl = getBrandLogoUrl(brand, 64);

        const markerDiv = document.createElement("div");
        render(
          () => <FuelMapMarkerIcon brand={brand} logoUrl={logoUrl} />,
          markerDiv,
        );
        const marker = L.marker([Number(latitude), Number(longitude)], {
          title: stationDetail.fuelStation.name,
          icon: L.divIcon({
            html: markerDiv,
            className: "custom-brand-marker",
            iconSize: [0, 0],
          }),
        });

        let dispose: (() => void) | null = null;

        marker.bindPopup(
          () => {
            const popupDiv = document.createElement("div");
            if (dispose) dispose();
            dispose = render(
              () => (
                <Show when={currentStationsMap().get(id)}>
                  {(latestDetail) => (
                    <FuelMapPopup
                      station={latestDetail().fuelStation}
                      prices={latestDetail().fuelPrices}
                      selectedFuelTypes={props.selectedFuelTypes}
                      brandMap={props.brandMap}
                      stateMetrics={props.stateMetrics}
                      areaMetrics={props.areaMetrics}
                    />
                  )}
                </Show>
              ),
              popupDiv,
            );
            return popupDiv;
          },
          {
            minWidth: 260,
            className: "custom-leaflet-popup",
          },
        );

        const cleanup = () => {
          if (dispose) {
            dispose();
            dispose = null;
          }
        };

        marker.on("popupclose", cleanup);
        marker.on("remove", cleanup);

        markers.set(id, marker);
        toAdd.push(marker);
      }
    }

    // Bulk add new markers
    if (toAdd.length > 0) {
      clusterGroup.addLayers(toAdd);
    }
  });

  onCleanup(() => {
    if (map) {
      map.remove();
    }
  });

  return (
    <div
      ref={mapContainer}
      class="w-full h-full isolate relative z-0 bg-slate-900"
    >
      <style>
        {`
				.custom-leaflet-popup .leaflet-popup-content-wrapper {
					background: transparent;
					padding: 0;
					box-shadow: none;
				}
				.custom-leaflet-popup .leaflet-popup-tip-container {
					display: none;
				}
				.custom-leaflet-popup .leaflet-popup-content {
					margin: 0;
					width: 100% !important;
				}
				`}
      </style>
    </div>
  );
}

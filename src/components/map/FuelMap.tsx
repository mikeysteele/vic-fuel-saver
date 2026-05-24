import { createEffect, createMemo, Show } from "solid-js";
import { render } from "solid-js/web";
import type * as LType from "leaflet";
import type { FuelMetricsAggregate, FuelMetricStat, FuelPriceDetail } from "~/features/fuel/types.ts";
import type { MapBounds } from "~/features/fuel/filters.ts";
import { getBrandLogoUrl } from "~/features/fuel/brandLogo.ts";
import { FuelMapPopup } from "./FuelMapPopup.tsx";
import { FuelMapMarkerIcon } from "./FuelMapMarkerIcon.tsx";
import { createLeafletMap } from "./createLeafletMap.ts";

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

export function FuelMap(props: FuelMapProps) {
  let mapContainer!: HTMLDivElement;
  const markers = new Map<string, LType.Marker>();

  const currentStationsMap = createMemo(() => {
    const map = new Map<string, FuelPriceDetail>();
    for (const s of props.stations) {
      map.set(s.fuelStation.id, s);
    }
    return map;
  });

  const { map, leafletRef, clusterGroup } = createLeafletMap({
    container: () => mapContainer,
    isDark: () => props.isDark,
    onViewportChange: props.onViewportChange,
    userLocation: () => props.userLocation,
    mapFocus: () => props.mapFocus
  });

  // Interactive metric panning
  createEffect(() => {
    const L = leafletRef();
    const currentMap = map();
    const currentClusterGroup = clusterGroup();
    const focus = props.mapFocus;

    if (currentMap && focus && L && currentClusterGroup) {
      currentMap.setView([focus.lat, focus.lng], 14, { animate: true });
      currentMap.once("moveend", () => {
        setTimeout(() => {
          const marker = markers.get(focus.stationId);
          if (marker) {
            currentClusterGroup.zoomToShowLayer(marker, () => marker.openPopup());
          }
        }, 100);
      });
    }
  });

  // Markers synchronization
  createEffect(() => {
    const L = leafletRef();
    const currentMap = map();
    const currentClusterGroup = clusterGroup();
    if (!currentMap || !L || !currentClusterGroup) return;

    const currentStations = props.stations;
    const newIds = new Set(currentStations.map((s) => s.fuelStation.id));
    const toRemove: LType.Marker[] = [];
    const toAdd: LType.Marker[] = [];

    // Determine stale markers
    for (const [id, marker] of markers.entries()) {
      if (!newIds.has(id)) {
        toRemove.push(marker);
        markers.delete(id);
      }
    }

    if (toRemove.length > 0) {
      currentClusterGroup.removeLayers(toRemove);
    }

    // Add new markers
    for (const stationDetail of currentStations) {
      const id = stationDetail.fuelStation.id;
      if (!markers.has(id)) {
        const { latitude, longitude } = stationDetail.fuelStation.location;
        const brand = props.brandMap[stationDetail.fuelStation.brandId] ?? "Fuel";
        const logoUrl = getBrandLogoUrl(brand, 64);

        const markerDiv = document.createElement("div");
        render(() => <FuelMapMarkerIcon brand={brand} logoUrl={logoUrl} />, markerDiv);

        const marker = L.marker([Number(latitude), Number(longitude)], {
          title: stationDetail.fuelStation.name,
          icon: L.divIcon({ html: markerDiv, className: "custom-brand-marker", iconSize: [0, 0] }),
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
          { minWidth: 260, className: "custom-leaflet-popup" },
        );

        const cleanup = () => {
          if (dispose) { dispose(); dispose = null; }
        };

        marker.on("popupclose", cleanup);
        marker.on("remove", cleanup);

        markers.set(id, marker);
        toAdd.push(marker);
      }
    }

    if (toAdd.length > 0) {
      currentClusterGroup.addLayers(toAdd);
    }
  });

  return (
    <div ref={mapContainer} class="w-full h-full isolate relative z-0 bg-slate-900">
      <style>
        {`
		.custom-leaflet-popup .leaflet-popup-content-wrapper { background: transparent; padding: 0; box-shadow: none; }
		.custom-leaflet-popup .leaflet-popup-tip-container { display: none; }
		.custom-leaflet-popup .leaflet-popup-content { margin: 0; width: 100% !important; }
		`}
      </style>
    </div>
  );
}

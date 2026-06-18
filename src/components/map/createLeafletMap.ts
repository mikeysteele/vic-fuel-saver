import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
import type * as LType from "leaflet";
import type { MapBounds } from "~/features/fuel/filters.ts";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import type { FuelMetricStat } from "~/features/fuel/types.ts";

const ICON_URL = "/assets/leaflet/marker-icon.png" as const;
const ICON_RETINA_URL = "/assets/leaflet/marker-icon-2x.png" as const;
const SHADOW_URL = "/assets/leaflet/marker-shadow.png" as const;

export function createLeafletMap(options: {
  container: () => HTMLDivElement | undefined;
  isDark?: () => boolean | undefined;
  onViewportChange?: (bounds: MapBounds) => void;
  userLocation?: () => { latitude: number; longitude: number } | null;
  mapFocus?: () => FuelMetricStat | null | undefined;
}) {
  const [map, setMap] = createSignal<LType.Map | null>(null);
  const [leafletRef, setLeafletRef] = createSignal<typeof LType | null>(null);
  const [clusterGroup, setClusterGroup] = createSignal<
    LType.MarkerClusterGroup | null
  >(null);

  let tileLayer: LType.TileLayer | null = null;

  onMount(async () => {
    const el = options.container();
    if (!el) return;

    const L = (await import("leaflet")).default;
    await import("leaflet/dist/leaflet.css");
    await import("leaflet.markercluster");

    // deno-lint-ignore no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: ICON_RETINA_URL,
      iconUrl: ICON_URL,
      shadowUrl: SHADOW_URL,
    });

    const newMap = L.map(el, { maxZoom: 18 }).setView([-37.8136, 144.9631], 10);

    const newClusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
    });
    newMap.addLayer(newClusterGroup);

    const updateBounds = () => {
      if (options.onViewportChange) {
        const b = newMap.getBounds();
        options.onViewportChange({
          north: b.getNorth(),
          south: b.getSouth(),
          east: b.getEast(),
          west: b.getWest(),
        });
      }
    };

    newMap.on("moveend", updateBounds);
    newMap.on("zoomend", updateBounds);

    updateBounds();

    setMap(() => newMap);
    setClusterGroup(() => newClusterGroup);
    setLeafletRef(() => L);
  });

  createEffect(() => {
    const L = leafletRef();
    const currentMap = map();
    if (currentMap && L) {
      if (tileLayer) {
        tileLayer.remove();
      }

      const isDark = options.isDark?.();
      const url = isDark
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

      const attribution = isDark
        ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

      tileLayer = L.tileLayer(url, { attribution, maxZoom: 18 });
      tileLayer.addTo(currentMap);
    }
  });

  createEffect(() => {
    const L = leafletRef();
    const currentMap = map();
    const loc = options.userLocation?.();
    if (currentMap && loc && L) {
      currentMap.setView(
        [loc.latitude, loc.longitude],
        13,
      );

      L.circleMarker(
        [loc.latitude, loc.longitude],
        {
          radius: 8,
          fillColor: "#a855f7",
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8,
        },
      ).addTo(currentMap);
    }
  });

  onCleanup(() => {
    const currentMap = map();
    if (currentMap) currentMap.remove();
  });

  return { map, leafletRef, clusterGroup };
}

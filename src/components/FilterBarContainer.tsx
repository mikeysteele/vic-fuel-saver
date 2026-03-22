import { type Component, createSignal } from "solid-js";
import FilterBar from "./FilterBar.tsx";

interface FilterBarContainerProps {
  fuelTypes: string[];
  brands: string[];
  brandMap: Record<string, string>;
  selectedFuelTypes: string[];
  selectedBrandIds: string[];
  userLocation: { latitude: number; longitude: number } | null;
  onFuelTypesChange: (types: string[]) => void;
  onBrandIdsChange: (brands: string[]) => void;
  onUserLocationChange: (
    loc: { latitude: number; longitude: number } | null,
  ) => void;
}

/**
 * Smart wrapper around FilterBar.
 * Owns the geolocation side-effect and "Near Me" toggle logic.
 * FilterBar itself remains a purely presentation-based dumb component.
 */
const FilterBarContainer: Component<FilterBarContainerProps> = (props) => {
  const [isExpanded, setIsExpanded] = createSignal(false);

  const handleNearMeClick = () => {
    if (props.userLocation) {
      props.onUserLocationChange(null);
      return;
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          props.onUserLocationChange({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error obtaining location", error);
          alert(
            "Failed to get your location. Please check browser permissions.",
          );
        },
      );
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  return (
    <div class="absolute top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-20 pointer-events-auto">
      <div class="animate-in fade-in slide-in-from-top-4 duration-700">
        <FilterBar
          fuelTypes={props.fuelTypes}
          brands={props.brands}
          brandMap={props.brandMap}
          selectedFuelTypes={props.selectedFuelTypes}
          selectedBrandIds={props.selectedBrandIds}
          userLocation={props.userLocation}
          onFuelTypesChange={props.onFuelTypesChange}
          onBrandIdsChange={props.onBrandIdsChange}
          onNearMeClick={handleNearMeClick}
          isExpanded={isExpanded()}
          onToggleExpanded={() => setIsExpanded(!isExpanded())}
        />
      </div></div>
  );
};

export default FilterBarContainer;

import { Show } from "solid-js";
import { Button } from "../ui/Button.tsx";
import { Label } from "../ui/Label.tsx";
import { Panel } from "../ui/Panel.tsx";
import { MultiSelect } from "../ui/MultiSelect.tsx";
import { withFavouratable } from "../ui/FavouriteSelection.tsx";

const FavouratableMultiSelect = withFavouratable((props) => {
  return (
    <MultiSelect
      id={props.id}
      labelMap={props.labelMap}
      options={props.options}
      selected={props.selected as string[]}
      onChange={props.onChange}
      placeholder={props.placeholder}
    />
  );
});

interface FilterBarProps {
  fuelTypes: string[];
  brands: string[];
  brandMap: Record<string, string>;
  selectedFuelTypes: string[];
  selectedBrandIds: string[];
  userLocation: { latitude: number; longitude: number } | null;
  onFuelTypesChange: (types: string[]) => void;
  onBrandIdsChange: (brands: string[]) => void;
  onNearMeClick: () => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

/**
 * Dumb filter bar — purely presentational, no side-effects.
 * All user interactions are delegated to parent callbacks.
 */
export function FilterBar(props: FilterBarProps) {
  const activeCount = () =>
    props.selectedFuelTypes.length + props.selectedBrandIds.length;

  return (
    <Panel intent="glass" padding="md" class="relative group">
      {/* Decorative background glow */}
      <div class="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/20 dark:bg-orange-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Mobile Header (Only visible on small screens when collapsed or as a header when expanded) */}
      <div class="flex md:hidden items-center justify-between mb-0 gap-2">
        <button
          type="button"
          onClick={props.onToggleExpanded}
          class="flex-1 flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors"
        >
          <div class="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-orange-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path d="M22 3H2l8 9v6l4 4v-10L22 3z" />
            </svg>
            <span>Filters</span>
            <Show when={activeCount() > 0}>
              <span class="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {activeCount()}
              </span>
            </Show>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class={`h-4 w-4 transition-transform duration-300 ${
              props.isExpanded ? "rotate-180" : ""
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={props.onNearMeClick}
          class={`h-10 w-12 flex items-center justify-center rounded-xl transition-all shadow-sm border ${
            props.userLocation
              ? "bg-orange-500 border-orange-600 text-white"
              : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-500"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="w-5 h-5"
          >
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
        </button>
      </div>

      <div
        class={`relative z-10 flex flex-col md:flex-row gap-4 md:gap-6 items-end mt-3 md:mt-0 ${
          props.isExpanded ? "flex" : "hidden md:flex"
        }`}
      >
        <div class="flex-1 w-full flex flex-col gap-1.5">
          <Label intent="dim" size="xs" class="pl-1">
            Fuel Type
          </Label>
          <FavouratableMultiSelect
            id="fuel-type-filter"
            selected={props.selectedFuelTypes}
            options={props.fuelTypes}
            placeholder="All Fuel Types"
            onChange={(s) => props.onFuelTypesChange(s as string[])}
          />
        </div>
        <div class="flex-1 w-full flex flex-col gap-1.5">
          <Label intent="dim" size="xs" class="pl-1">
            Brand
          </Label>
          <FavouratableMultiSelect
            id="brand-select"
            selected={props.selectedBrandIds}
            options={props.brands}
            placeholder="All Brands"
            onChange={(s) => props.onBrandIdsChange(s as string[])}
            labelMap={props.brandMap}
          />
        </div>

        <div class="hidden md:block w-full md:w-auto flex-shrink-0">
          <Button
            type="button"
            onClick={props.onNearMeClick}
            intent={props.userLocation ? "primary" : "ghost"}
            size="md"
            class="w-full md:w-auto"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="w-5 h-5"
            >
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
            {props.userLocation ? "Clear" : "Near Me"}
          </Button>
        </div>
      </div>
    </Panel>
  );
}

import { Show } from "solid-js";
import { getBrandLogoUrl } from "~/features/fuel/brandLogo.ts";
import type { FuelStation } from "~/features/fuel/types.ts";

export interface FuelMapPopupHeaderProps {
  station: FuelStation;
  brandMap: Record<string, string>;
}

export function FuelMapPopupHeader(props: FuelMapPopupHeaderProps) {
  const brandName = () => props.brandMap[props.station.brandId] || "Fuel";
  const logoUrl = () => getBrandLogoUrl(brandName(), 32);

  return (
    <div class="p-3 border-b border-slate-100 dark:border-white/5 flex items-center gap-2.5 bg-slate-50 dark:bg-slate-900/40">
      <Show when={logoUrl()}>
        <img
          src={logoUrl()!}
          class="w-6 h-6 object-contain shrink-0 bg-white rounded-full border border-slate-100 dark:border-slate-800 p-0.5"
        />
      </Show>
      <div class="flex flex-col overflow-hidden">
        <span class="font-bold text-sm text-slate-900 dark:text-white leading-tight truncate">
          {props.station.name}
        </span>
        <span class="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
          {props.station.address}, {props.station.suburb}
        </span>
      </div>
    </div>
  );
}

import { createSignal } from "solid-js";

export interface FuelMapMarkerIconProps {
  brand?: string;
  logoUrl?: string;
}

export function FuelMapMarkerIcon(props: FuelMapMarkerIconProps) {
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

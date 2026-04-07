import { createSignal, Show } from "solid-js";
import { getBrandLogoUrl } from "~/lib/brandLogo.ts";
import { iconBoxVariants } from "~/design-system/variants.ts";

interface StationHeaderProps {
  name: string;
  brandId: string;
}

function StationHeader(props: StationHeaderProps) {
  const [imageError, setImageError] = createSignal(false);
  const logoUrl = () => getBrandLogoUrl(props.brandId, 128);

  return (
    <div class="flex items-start justify-between gap-4 mb-2">
      <div class="flex items-center gap-3">
        <Show
          when={logoUrl() && !imageError()}
          fallback={
            <div class={iconBoxVariants({ intent: "standard", size: "md" }) + " rounded-full"}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-slate-400"
              >
                <line x1="18" y1="20" x2="18" y2="10" />
                <path d="M12 20h-4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2Z" />
                <path d="M14 6h-4" />
                <path d="M8 10h-2" />
              </svg>
            </div>
          }
        >
          <img
            src={logoUrl()!}
            alt={`${props.brandId} logo`}
            class="w-10 h-10 object-contain bg-white rounded-full p-1 border border-white/20 shadow-sm shrink-0 transition-opacity duration-300"
            onError={() => setImageError(true)}
          />
        </Show>
        <h2 class="text-xl md:text-2xl font-bold tracking-tight text-white leading-tight">
          {props.name}
        </h2>
      </div>
    </div>
  );
};

export default StationHeader;

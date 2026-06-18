import { Show } from "solid-js";
import { labelVariants } from "~/components/ui/variants.ts";

interface StationAddressProps {
  address: {
    addressLine1: string;
    addressLine2?: string;
    suburb: string;
    state: string;
    postcode: string;
  };
}

export function StationAddress(props: StationAddressProps) {
  return (
    <div class="flex items-start text-slate-400 group-hover:text-slate-300 transition-colors">
      <div class="mt-0.5 mr-2 shrink-0">
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
          class="w-4 h-4 opacity-70"
        >
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 0 0 1 16 0Z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>
      <div class="flex flex-col">
        <span
          class={labelVariants({ intent: "neutral", size: "sm" }) +
            " !normal-case tracking-normal"}
        >
          {props.address.addressLine1}
        </span>
        <Show when={props.address.addressLine2}>
          <span
            class={labelVariants({ intent: "neutral", size: "sm" }) +
              " !normal-case tracking-normal"}
          >
            {props.address.addressLine2}
          </span>
        </Show>
      </div>
    </div>
  );
}

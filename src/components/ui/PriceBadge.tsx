import type { JSX } from "solid-js";
import { type VariantProps } from "class-variance-authority";
import { priceBadgeVariants } from "./variants.ts";
import { splitProps } from "solid-js";

export interface PriceBadgeProps
  extends
    JSX.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof priceBadgeVariants> {}

export function PriceBadge(props: PriceBadgeProps) {
  const [local, others] = splitProps(props, ["intent", "class", "children"]);
  return (
    <span
      class={priceBadgeVariants({ intent: local.intent }) +
        (local.class ? ` ${local.class}` : "")}
      {...others}
    >
      {local.children}
    </span>
  );
}

import type { JSX  } from "solid-js";
import { type VariantProps } from "class-variance-authority";
import { metricCardLabelVariants, metricCardVariants } from "./variants.ts";
import { splitProps } from "solid-js";

export interface MetricCardProps
  extends JSX.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof metricCardVariants> {
  label: string;
}

export function MetricCard(props: MetricCardProps) {
  const [local, others] = splitProps(props, [
    "intent",
    "label",
    "class",
    "children",
  ]);
  return (
    <div
      class={metricCardVariants({ intent: local.intent }) + " p-2 sm:p-4" +
        (local.class ? ` ${local.class}` : "")}
      {...others}
    >
      <p class={metricCardLabelVariants({ intent: local.intent })}>
        {local.label}
      </p>
      <div class="flex flex-col gap-3">
        {local.children}
      </div>
    </div>
  );
};

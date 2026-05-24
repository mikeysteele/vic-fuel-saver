import type { JSX  } from "solid-js";
import { type VariantProps } from "class-variance-authority";
import { labelVariants } from "./variants.ts";
import { splitProps } from "solid-js";

export interface LabelProps
  extends JSX.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {}

export function Label(props: LabelProps) {
  const [local, others] = splitProps(props, [
    "intent",
    "size",
    "class",
    "children",
  ]);
  return (
    <label
      class={labelVariants({ intent: local.intent, size: local.size }) +
        (local.class ? ` ${local.class}` : "")}
      {...others}
    >
      {local.children}
    </label>
  );
};

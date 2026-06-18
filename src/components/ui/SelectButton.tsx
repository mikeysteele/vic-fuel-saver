import type { JSX } from "solid-js";
import { type VariantProps } from "class-variance-authority";
import { inputVariants } from "./variants.ts";
import { splitProps } from "solid-js";

export interface SelectButtonProps
  extends
    JSX.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof inputVariants> {}

export function SelectButton(props: SelectButtonProps) {
  const [local, others] = splitProps(props, ["intent", "class", "children"]);
  return (
    <button
      type="button"
      class={inputVariants({ intent: local.intent }) +
        (local.class ? ` ${local.class}` : "")}
      {...others}
    >
      {local.children}
    </button>
  );
}

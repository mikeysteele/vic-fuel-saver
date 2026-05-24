import type { JSX  } from "solid-js";
import { type VariantProps } from "class-variance-authority";
import { iconBoxVariants } from "./variants.ts";
import { splitProps } from "solid-js";

export interface IconBoxProps
  extends JSX.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof iconBoxVariants> {}

export function IconBox(props: IconBoxProps) {
  const [local, others] = splitProps(props, [
    "intent",
    "size",
    "class",
    "children",
  ]);
  return (
    <div
      class={iconBoxVariants({ intent: local.intent, size: local.size }) +
        (local.class ? ` ${local.class}` : "")}
      {...others}
    >
      {local.children}
    </div>
  );
};

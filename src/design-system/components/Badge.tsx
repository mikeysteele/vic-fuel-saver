import type { Component, JSX } from "solid-js";
import { type VariantProps } from "class-variance-authority";
import { badgeVariants } from "../variants.ts";
import { splitProps } from "solid-js";

export interface BadgeProps
  extends JSX.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge: Component<BadgeProps> = (props) => {
  const [local, others] = splitProps(props, [
    "intent",
    "size",
    "class",
    "children",
  ]);
  return (
    <span
      class={badgeVariants({ intent: local.intent, size: local.size }) +
        (local.class ? ` ${local.class}` : "")}
      {...others}
    >
      {local.children}
    </span>
  );
};

import type { Component, JSX } from "solid-js";
import { type VariantProps } from "class-variance-authority";
import { panelVariants } from "../variants.ts";
import { splitProps } from "solid-js";

export interface PanelProps
  extends JSX.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof panelVariants> {}

export const Panel: Component<PanelProps> = (props) => {
  const [local, others] = splitProps(props, [
    "intent",
    "padding",
    "class",
    "children",
  ]);
  return (
    <div
      class={panelVariants({ intent: local.intent, padding: local.padding }) +
        (local.class ? ` ${local.class}` : "")}
      {...others}
    >
      {local.children}
    </div>
  );
};

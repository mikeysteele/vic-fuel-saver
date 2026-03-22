import type { Component, JSX } from "solid-js";
import { type VariantProps } from "class-variance-authority";
import { buttonVariants } from "../variants.ts";
import { splitProps } from "solid-js";

export interface ButtonProps
  extends JSX.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button: Component<ButtonProps> = (props) => {
  const [local, others] = splitProps(props, [
    "intent",
    "size",
    "class",
    "children",
  ]);
  return (
    <button
      class={buttonVariants({ intent: local.intent, size: local.size }) +
        (local.class ? ` ${local.class}` : "")}
      {...others}
    >
      {local.children}
    </button>
  );
};

import { createSignal, onMount, Show, type JSX } from "solid-js";

interface ClientOnlyProps {
  children: JSX.Element;
  fallback?: JSX.Element;
}

export function ClientOnly(props: ClientOnlyProps) {
  const [isMounted, setIsMounted] = createSignal(false);
  onMount(() => {
    setIsMounted(true);
  });

  return (
    <Show when={isMounted()} fallback={props.fallback}>
      {props.children}
    </Show>
  );
}

import { Show } from "solid-js";
import { Button } from "../ui/Button.tsx";

interface AppOverlaysProps {
  loading: () => boolean;
  error: () => Error | null;
  refetch: () => void;
}

export function AppOverlays(props: AppOverlaysProps) {
  return (
    <>
      {/* Loading overlay */}
      <Show when={props.loading()}>
        <div class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90 dark:bg-slate-950/80 backdrop-blur-sm space-y-4">
          <div class="animate-spin h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
          <p class="text-slate-600 dark:text-slate-400 font-medium animate-pulse">
            Scanning live prices...
          </p>
        </div>
      </Show>

      {/* Error overlay */}
      <Show when={props.error()}>
        <div class="absolute inset-0 z-50 flex items-center justify-center bg-white/90 dark:bg-slate-950/80 backdrop-blur-sm p-4">
          <div class="rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-8 text-center max-w-2xl w-full shadow-2xl">
            <h3 class="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
              Connection Disturbed
            </h3>
            <p class="text-red-800/80 dark:text-red-200/80 mb-6">
              {(props.error() as Error)?.message ?? "Failed to load fuel data."}
            </p>
            <Button
              onClick={() => props.refetch()}
              intent="unstyled"
              class="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] active:scale-95"
            >
              Try Again
            </Button>
          </div>
        </div>
      </Show>
    </>
  );
};



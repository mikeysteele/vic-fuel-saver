import { type Component } from "solid-js";

const Attribution: Component = () => (
  <div class="fixed bottom-0 left-0 z-[60] pointer-events-auto">
    <div class="text-[9px] sm:text-[10px] hover:text-slate-600 dark:hover:text-slate-300 transition-colors drop-shadow-sm  bg-white/80 dark:bg-black/10 backdrop-blur-[2px]">
      Logos by{" "}
      <a
        href="https://logo.dev"
        target="_blank"
        rel="noopener noreferrer"
        class="underline underline-offset-2"
      >
        Logo.dev
      </a>
    </div>
  </div>
);

export default Attribution;

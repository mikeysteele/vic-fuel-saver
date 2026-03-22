import { type Component, Show } from "solid-js";
import { IconBox } from "../../design-system/components/IconBox.tsx";
import { Label } from "../../design-system/components/Label.tsx";
import { Panel } from "../../design-system/components/Panel.tsx";
import { Button } from "../../design-system/components/Button.tsx";
import { getVictorianDisplayDate } from "../../lib/date.ts";

interface HeaderProps {
  theme: () => string;
  toggleTheme: () => void;
  latestUpdatedAt: () => string | null;
}

const MoonIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9" />
  </svg>
);

const SunIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const Header: Component<HeaderProps> = (props) => {
  return (
    <Panel
      intent="glass"
      padding="none"
      class="shrink-0 z-40 w-full !rounded-none border-t-0 border-x-0 !shadow-lg relative"
    >
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 md:h-20 items-center justify-between">
          {/* Logo */}
          <div class="flex-shrink-0 flex items-center gap-2 md:gap-3">
            <IconBox intent="gradient" size="md" class="md:h-12 md:w-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-white w-5 h-5 md:w-6 md:h-6"
              >
                <path d="M3 22v-8c0-1.1.9-2 2-2h14a2 2 0 0 1 2 2v8" />
                <path d="M6 12v-5a6 6 0 0 1 12 0v5" />
                <path d="M12 22V6" />
                <path d="M12 6c-2.76 0-5 2.24-5 5" />
                <path d="M12 6c2.76 0 5 2.24 5 5" />
              </svg>
            </IconBox>
            <div class="flex flex-col">
              <h1 class="text-xl md:text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-500 dark:from-white dark:to-slate-400 leading-none">
                FuelSaver
              </h1>
              <div class="flex items-center gap-2 mt-0.5">
                <Label intent="dim" size="xs">
                  Victoria
                </Label>
                <Show when={props.latestUpdatedAt()}>
                  <span class="text-[10px] text-slate-400 dark:text-slate-500 font-medium px-1.5 border-l border-slate-300 dark:border-slate-700">
                    Prices as of{" "}
                    <span class="text-slate-500 dark:text-slate-400">
                      {getVictorianDisplayDate(props.latestUpdatedAt())}
                    </span>
                  </span>
                </Show>
              </div>
            </div>
          </div>

          {/* Theme toggle */}
          <div class="flex items-center gap-4">
            <Button
              onClick={props.toggleTheme}
              intent="ghost"
              size="md"
              class="!p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm"
              aria-label="Toggle Theme"
              type="button"
            >
              <Show when={props.theme() === "dark"} fallback={<MoonIcon />}>
                <SunIcon />
              </Show>
            </Button>
          </div>
        </div>
      </div>
    </Panel>
  );
};

export default Header;

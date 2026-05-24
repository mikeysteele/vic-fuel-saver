import { createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { Panel } from "./Panel.tsx";
import { SelectButton } from "./SelectButton.tsx";
import { withDocument } from "../../lib/safe-dom.ts";

export interface MultiSelectProps {
  id: string;
  options: string[];
  selected: string[];
  placeholder: string;
  onChange: (selected: string[]) => void;
  labelMap?: Record<string, string>;
}

export function MultiSelect(props: MultiSelectProps) {
  const [isOpen, setIsOpen] = createSignal(false);
  let containerRef: HTMLDivElement | undefined;

  const toggleOption = (option: string) => {
    const next = props.selected.includes(option)
      ? props.selected.filter((item) => item !== option)
      : [...props.selected, option];
    props.onChange(next);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (containerRef && !containerRef.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };
  if (typeof document !== "undefined") {
    onMount(() => {
      withDocument(document => document.addEventListener("click", handleClickOutside));
    });

    onCleanup(() => {
      withDocument(document => document.removeEventListener("click", handleClickOutside));
    });
  }
  const getLabel = (opt: string) => props.labelMap?.[opt] ?? opt;

  const displayText = () => {
    if (props.selected.length === 0) return props.placeholder;
    if (props.selected.length === 1) return getLabel(props.selected[0]);
    return `${props.selected.length} Selected`;
  };

  return (
    <div class="relative w-full" ref={containerRef}>
      <SelectButton
        id={props.id}
        onClick={() => setIsOpen(!isOpen())}
        intent={isOpen() ? "focused" : "standard"}
      >
        <span class="truncate pr-2">{displayText()}</span>
        <div class="flex items-center gap-2 shrink-0">
          <Show when={props.selected.length > 0}>
            <div
              class="text-xs bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold px-1.5 py-0.5 rounded mr-1 hover:bg-orange-200 dark:hover:bg-orange-500/30 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                props.onChange([]);
              }}
            >
              Clear
            </div>
          </Show>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class={`transition-transform duration-300 ${isOpen() ? "rotate-180" : ""
              }`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </SelectButton>

      <Show when={isOpen()}>
        <Panel
          intent="floating"
          padding="none"
          class="absolute top-full left-0 w-full mt-2 z-[100] max-h-64 overflow-y-auto w-full origin-top animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div class="p-1">
            <For each={props.options}>
              {(option) => (
                <label
                  class={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 cursor-pointer group ${props.selected.includes(option)
                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                >
                  <div class="relative flex items-center justify-center w-4 h-4 shrink-0">
                    <input
                      type="checkbox"
                      class="peer appearance-none w-4 h-4 border-2 border-slate-300 dark:border-slate-600 rounded cursor-pointer checked:border-orange-500 dark:checked:border-orange-500 checked:bg-orange-500 dark:checked:bg-orange-500 transition-colors focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                      checked={props.selected.includes(option)}
                      onChange={() => toggleOption(option)}
                    />
                    <svg
                      class="absolute w-2.5 h-2.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="4"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span class="truncate">{getLabel(option)}</span>
                </label>
              )}
            </For>
            <Show when={props.options.length === 0}>
              <div class="px-4 py-3 text-sm text-slate-500 text-center italic">
                No options available
              </div>
            </Show>
          </div>
        </Panel>
      </Show>
    </div>
  );
};



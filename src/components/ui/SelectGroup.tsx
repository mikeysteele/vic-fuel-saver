import { For } from "solid-js";

interface SelectGroupProps {
  id?: string;
  label: string;
  value: string | undefined | null;
  options: string[];
  placeholder: string;
  onChange: (value: string | null) => void;
  optionLabels?: Record<string, string>;
}

export function SelectGroup(props: SelectGroupProps) {
  return (
    <div class="flex flex-col space-y-1.5 flex-1 min-w-[200px]">
      <label
        for={props.id}
        class="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase ml-1"
      >
        {props.label}
      </label>
      <div class="relative group">
        <select
          id={props.id}
          class="w-full appearance-none bg-white dark:bg-slate-900/40 border border-slate-300 dark:border-slate-700/50 text-slate-900 dark:text-slate-200 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all shadow-sm dark:shadow-inner hover:bg-slate-50 dark:hover:bg-slate-800/60"
          value={props.value || ""}
          onChange={(e) => props.onChange(e.currentTarget.value || null)}
        >
          <option value="">{props.placeholder}</option>
          <For each={props.options}>
            {(option) => (
              <option value={option}>
                {props.optionLabels?.[option] || option}
              </option>
            )}
          </For>
        </select>
        {/* Custom Arrow */}
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-slate-400 group-hover:text-orange-500 transition-colors">
          <svg class="h-4 w-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

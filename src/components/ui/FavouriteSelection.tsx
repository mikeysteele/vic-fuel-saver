import {
  type Component,
  createContext,
  createEffect,
  createSignal,
  type JSX,
  onMount,
  useContext,
} from "solid-js";

interface FavouratableContextType {
  value: () => unknown;
  setValue: (val?: unknown) => void;
  isFavourited: () => boolean;
  toggleFavourited: () => void;
}

const FavouratableContext = createContext<FavouratableContextType>();

export const useFavouratable = () => useContext(FavouratableContext);

const safeLocalStorage = {
  getItem: (key: string) => {
    try {
      return typeof localStorage !== "undefined" &&
          typeof localStorage.getItem === "function"
        ? localStorage.getItem(key)
        : null;
    } catch (_e) {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      if (
        typeof localStorage !== "undefined" &&
        typeof localStorage.setItem === "function"
      ) {
        localStorage.setItem(key, value);
      }
    } catch (_e) {
      // ignore
    }
  },
  removeItem: (key: string) => {
    try {
      if (
        typeof localStorage !== "undefined" &&
        typeof localStorage.removeItem === "function"
      ) {
        localStorage.removeItem(key);
      }
    } catch (_e) {
      // ignore
    }
  },
};

export interface FavouratableContainerProps {
  storageKey: string;
  initialValue?: unknown;
  children: JSX.Element;
  onValueChange?: (val: unknown) => void;
}

/**
 * A wrapper component that manages form element persistence in local storage.
 * It provides a context for the FavourableIcon to toggle favouriting.
 */
export function Favouratable(props: FavouratableContainerProps) {
  const [value, setValue] = createSignal(props.initialValue ?? []);
  const [isFavourited, setIsFavourited] = createSignal(false);

  const key = () => `favourite_${props.storageKey}`;

  onMount(() => {
    const saved = safeLocalStorage.getItem(key());
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        setValue(parsed);
        setIsFavourited(true);
        props.onValueChange?.(parsed);
      } catch (_e) {
        // Fallback for non-JSON strings
        setValue([saved]);
        setIsFavourited(true);
        props.onValueChange?.([saved]);
      }
    }
  });

  // Sync value to localStorage if favourited
  createEffect(() => {
    if (isFavourited()) {
      safeLocalStorage.setItem(key(), JSON.stringify(value()));
    } else {
      safeLocalStorage.removeItem(key());
    }
  });

  const context: FavouratableContextType = {
    value,
    setValue: (val?: unknown) => {
      setValue(val ?? []);
      props.onValueChange?.(val ?? []);
    },
    isFavourited,
    toggleFavourited: () => setIsFavourited(!isFavourited()),
  };

  return (
    <FavouratableContext.Provider value={context}>
      {props.children}
    </FavouratableContext.Provider>
  );
}

/**
 * A toggleable star icon that connects to the nearest Favouratable context.
 */
export function FavourableIcon(props: { class?: string }) {
  const context = useFavouratable();
  if (!context) return null;

  return (
    <button
      type="button"
      onClick={(_e) => {
        _e.preventDefault();
        _e.stopPropagation();
        context.toggleFavourited();
      }}
      class={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center shrink-0 ${
        context.isFavourited()
          ? "text-amber-500 bg-amber-500/10 scale-110 shadow-sm shadow-amber-500/10"
          : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
      } ${props.class || ""}`}
      title={context.isFavourited()
        ? "Remove from favourites"
        : "Add to favourites"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={context.isFavourited() ? "currentColor" : "none"}
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="transition-transform duration-300"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
  );
}

export interface FavouratableComponentProps {
  id: string;
  options: string[];
  selected: unknown;
  onChange: (selected: unknown) => void;
  placeholder: string;
  labelMap?: Record<string, string>;
}

/**
 * A Higher-Order Component (HOC) that wraps an input or custom component
 * with Favouratable logic and automatically adds the FavourableIcon.
 */
export function withFavouratable<P extends FavouratableComponentProps>(
  BaseComponent: Component<P>,
): Component<P & { storageKey?: string; wrapperClass?: string }> {
  return (props) => {
    const storageKey = () =>
      props.storageKey || props.id || "unnamed_favourite";

    return (
      <Favouratable
        storageKey={storageKey()}
        onValueChange={(val: unknown) => {
          props.onChange?.(val);
        }}
      >
        <div
          class={`flex items-center gap-2 w-full group/favourable ${
            props.wrapperClass || ""
          }`}
        >
          <div class="flex-1">
            <FavouratableConsumer BaseComponent={BaseComponent} {...props} />
          </div>
          <FavourableIcon />
        </div>
      </Favouratable>
    );
  };
}

/** @internal Internal consumer for the HOC to bridge context values back to props */
function FavouratableConsumer<P extends FavouratableComponentProps>(
  props: P & { value?: unknown; BaseComponent: Component<P> },
) {
  const context = useFavouratable()!;

  // Support both 'value' (standard) and 'selected' (MultiSelect) patterns
  const isMultiSelect = () => "selected" in props;

  return (
    <props.BaseComponent
      {...props}
      {...(isMultiSelect()
        ? { selected: context.value() || props.selected || [] }
        : {
          value: (context.value() as string) || (props.value as string) || "",
        })}
      onChange={(val: unknown) => {
        context.setValue(val);
        props.onChange?.(val);
      }}
    />
  );
}

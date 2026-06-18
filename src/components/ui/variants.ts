/**
 * Design system variants — CVA-based class builders for reusable interactive elements.
 * Import and call these in *dumb* components to avoid repeating long Tailwind strings.
 */
import { cva } from "class-variance-authority";

/**
 * Price comparison badge (e.g. "4.5¢ below State", "State Average", "above Area")
 */
export const priceBadgeVariants = cva(
  // Base classes shared by all variants
  "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border leading-none",
  {
    variants: {
      intent: {
        below:
          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        above:
          "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
        neutral:
          "bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20",
      },
    },
    defaultVariants: {
      intent: "neutral",
    },
  },
);

export type PriceBadgeIntent = "below" | "above" | "neutral";

/**
 * Standard glassmorphism panel — used for the main container of components.
 */
export const panelVariants = cva("rounded-2xl transition-all duration-300", {
  variants: {
    intent: {
      glass:
        "bg-white/95 dark:bg-slate-950/95 backdrop-blur-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-visible",
      floating:
        "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-lg",
    },
    padding: {
      none: "p-0",
      sm: "p-3 sm:p-4",
      md: "p-4 sm:p-6",
    },
  },
  defaultVariants: {
    intent: "glass",
    padding: "md",
  },
});

/**
 * Common label patterns for the small uppercase headers.
 */
export const labelVariants = cva(
  "block font-semibold uppercase tracking-widest leading-tight",
  {
    variants: {
      intent: {
        dim: "text-slate-500 dark:text-slate-400",
        primary: "text-orange-600 dark:text-orange-400",
        neutral: "text-slate-700 dark:text-slate-300",
      },
      size: {
        xs: "text-[10px] md:text-xs",
        sm: "text-xs md:text-sm",
      },
    },
    defaultVariants: {
      intent: "dim",
      size: "xs",
    },
  },
);

/**
 * Component input / select base styles.
 */
export const inputVariants = cva(
  "w-full h-10 px-4 flex items-center justify-between rounded-xl border transition-all text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none focus:border-orange-500 overflow-hidden",
  {
    variants: {
      intent: {
        standard:
          "bg-slate-50 dark:bg-slate-950/50 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-900/80",
        focused:
          "bg-white dark:bg-slate-900 border-orange-500 text-slate-900 dark:text-white",
      },
    },
    defaultVariants: {
      intent: "standard",
    },
  },
);

/**
 * Small box container for icons / logos with gradients.
 */
export const iconBoxVariants = cva(
  "flex items-center justify-center shrink-0 rounded-xl transition-all",
  {
    variants: {
      intent: {
        standard:
          "bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10",
        primary: "bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]",
        gradient:
          "bg-gradient-to-br from-orange-500 to-amber-600 shadow-[0_4px_12px_rgba(249,115,22,0.2)]",
      },
      size: {
        sm: "h-8 w-8",
        md: "h-10 w-10",
        lg: "h-12 w-12",
      },
    },
    defaultVariants: {
      intent: "standard",
      size: "md",
    },
  },
);

/**
 * Primary button — used for actions like "Near Me" (active) and other CTAs.
 */
export const buttonVariants = cva(
  "font-semibold transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap flex-shrink-0",
  {
    variants: {
      intent: {
        primary:
          "bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:bg-orange-600",
        ghost:
          "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white",
        viewToggleActive: "bg-orange-500 shadow-md text-white",
        viewToggleInactive:
          "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200",
        unstyled: "inline b-0 bg-transparent shadow-none",
      },
      size: {
        sm: "h-8 px-4 text-sm rounded-lg",
        md: "h-[42px] px-6 rounded-xl",
        viewToggle: "px-6 py-2 rounded-lg text-sm",
      },
    },
    defaultVariants: {
      intent: "ghost",
      size: "md",
    },
  },
);

/**
 * General purpose badges (e.g. Fuel Type markers)
 */
export const badgeVariants = cva(
  "inline-flex items-center justify-center font-black uppercase tracking-wider rounded shadow-sm leading-none",
  {
    variants: {
      intent: {
        dark: "bg-slate-800 text-white dark:bg-white dark:text-slate-900",
        primary: "bg-orange-500 text-white",
        outline:
          "border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400",
      },
      size: {
        xs: "text-[10px] px-1.5 py-0.5",
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-3 py-1",
      },
    },
    defaultVariants: {
      intent: "dark",
      size: "sm",
    },
  },
);

/**
 * Station card — controls the glassmorphism / hover lift effect.
 */
export const stationCardVariants = cva(
  "group relative flex flex-col border rounded-2xl transition-all duration-500 overflow-hidden w-full backdrop-blur-md",
  {
    variants: {
      state: {
        default:
          "border-slate-200 dark:border-white/10 p-6 md:p-8 bg-white/80 dark:bg-white/[0.03] hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgb(249,115,22,0.15)] hover:border-orange-500/30 hover:bg-white dark:hover:bg-white/[0.05]",
      },
    },
    defaultVariants: {
      state: "default",
    },
  },
);

/**
 * Metric card section — cheapest / average / most-expensive panels.
 */
export const metricCardVariants = cva(
  "backdrop-blur-xl rounded-2xl p-4 flex-1 min-w-0",
  {
    variants: {
      intent: {
        cheap:
          "bg-white/95 dark:bg-slate-950/80 border border-teal-200 dark:border-teal-500/30 shadow-[0_8px_30px_rgba(20,184,166,0.15)]",
        avg:
          "bg-white/95 dark:bg-slate-950/80 border border-orange-200 dark:border-orange-500/30 shadow-[0_8px_30px_rgba(249,115,22,0.15)]",
        expensive:
          "bg-white/95 dark:bg-slate-950/80 border border-rose-200 dark:border-rose-500/30 shadow-[0_8px_30px_rgba(244,63,94,0.15)]",
      },
    },
  },
);

export const metricCardLabelVariants = cva(
  "text-[10px] sm:text-xs font-semibold uppercase tracking-widest mb-3 text-center leading-tight truncate w-full border-b pb-2",
  {
    variants: {
      intent: {
        cheap: "text-teal-600 dark:text-teal-400/80 border-teal-500/20",
        avg: "text-orange-600 dark:text-orange-400/80 border-orange-500/20",
        expensive: "text-rose-600 dark:text-rose-400/80 border-rose-500/20",
      },
    },
  },
);

/**
 * Design system tokens — single source of truth for colours, spacing, radii, and shadows.
 * Only plain string/number constants here (no Tailwind, no framework deps).
 */

export const color = {
  /** Brand orange — primary action and accent */
  brand: {
    50: "#fff7ed",
    100: "#ffedd5",
    400: "#fb923c",
    500: "#f97316",
    600: "#ea580c",
  },
  /** Positive / cheap price indicator */
  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
  },
  /** Danger / expensive price indicator */
  danger: {
    50: "#fff1f2",
    100: "#ffe4e6",
    400: "#fb7185",
    500: "#f43f5e",
    600: "#e11d48",
    700: "#be123c",
  },
  /** Neutral slate scale */
  neutral: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
    950: "#020617",
  },
  /** Teal for "cheapest" metric card */
  teal: {
    200: "#99f6e4",
    300: "#5eead4",
    400: "#2dd4bf",
    500: "#14b8a6",
    600: "#0d9488",
    700: "#0f766e",
  },
} as const;

export const radius = {
  sm: "rounded-lg", // 8px
  md: "rounded-xl", // 12px
  lg: "rounded-2xl", // 16px
  xl: "rounded-3xl", // 24px
} as const;

export const shadow = {
  card: "shadow-[0_8px_30px_rgba(0,0,0,0.08)]",
  cardHover: "shadow-[0_12px_40px_rgb(249,115,22,0.15)]",
  brandGlow: "shadow-[0_0_20px_rgba(249,115,22,0.4)]",
  metricCheap: "shadow-[0_8px_30px_rgba(20,184,166,0.15)]",
  metricAvg: "shadow-[0_8px_30px_rgba(249,115,22,0.15)]",
  metricExpensive: "shadow-[0_8px_30px_rgba(244,63,94,0.15)]",
  overlay: "shadow-2xl",
} as const;

export const blur = {
  panel: "backdrop-blur-xl",
  header: "backdrop-blur-xl",
} as const;

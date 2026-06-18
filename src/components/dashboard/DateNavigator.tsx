import { cn } from "../../lib/utils.ts";
import { getVictorianISODate } from "../../lib/date.ts";

interface DateNavigatorProps {
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
  earliestDate: Date | null;
  class?: string;
}

const ChevronLeft = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const ChevronRight = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

export function DateNavigator(props: DateNavigatorProps) {
  const isToday = () => {
    if (!props.selectedDate) return true;
    const today = new Date();
    return props.selectedDate.toDateString() === today.toDateString();
  };

  const isEarliest = () => {
    if (!props.selectedDate || !props.earliestDate) return false;
    const selected = getVictorianISODate(props.selectedDate);
    const earliest = getVictorianISODate(props.earliestDate);
    return selected === earliest;
  };

  const handlePrev = () => {
    const d = new Date(props.selectedDate || new Date());
    d.setDate(d.getDate() - 1);

    if (props.earliestDate) {
      const dStr = getVictorianISODate(d) || "";
      const earliestStr = getVictorianISODate(props.earliestDate) || "";
      if (dStr && earliestStr && dStr < earliestStr) return;
    }
    props.onDateChange(d);
  };

  const handleNext = () => {
    if (isToday()) return;
    const d = new Date(props.selectedDate || new Date());
    d.setDate(d.getDate() + 1);
    const today = new Date();
    if (d > today) {
      props.onDateChange(null);
    } else {
      props.onDateChange(d);
    }
  };

  const handleDateInput = (e: Event) => {
    const val = (e.target as HTMLInputElement).value;
    if (!val) return;
    // Parse YYYY-MM-DD as LOCAL time (not UTC!) to prevent day-shift in AEST/AEDT
    const [year, month, day] = val.split("-").map(Number);
    const d = new Date(year, month - 1, day);

    // Enforce earliest date bound
    const dStr = getVictorianISODate(d) || "";
    if (props.earliestDate) {
      const earliestStr = getVictorianISODate(props.earliestDate) || "";
      if (dStr && earliestStr && dStr < earliestStr) {
        // Force the earliest possible date if they tried to bypass HTML min attribute
        props.onDateChange(props.earliestDate);
        return;
      }
    }

    const todayStr = getVictorianISODate(new Date()) || "";
    if (dStr === todayStr || (dStr && todayStr && dStr > todayStr)) {
      props.onDateChange(null); // Switch to live mode for today or future dates
    } else {
      props.onDateChange(d);
    }
  };

  const displayDate = () => {
    const d = props.selectedDate || new Date();
    return d.toLocaleDateString("en-AU", {
      timeZone: "Australia/Melbourne",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).replace(/\//g, ".");
  };

  const inputDateValue = () => {
    const dStr = getVictorianISODate(props.selectedDate || new Date());
    return dStr || "";
  };

  return (
    <div
      class={cn(
        "flex items-center gap-1 p-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 transition-all duration-300",
        props.class,
      )}
    >
      {/* Back button */}
      <button
        type="button"
        onClick={handlePrev}
        disabled={isEarliest()}
        class="p-2 rounded-xl text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
        title="Previous Day"
      >
        <ChevronLeft />
      </button>

      {/* Date Display & Picker */}
      <div class="relative group flex items-center px-4 py-1.5 min-w-[140px] justify-center">
        <span class="text-base font-bold tracking-tight text-slate-700 dark:text-slate-200 selection:bg-transparent cursor-default">
          {displayDate()}
        </span>
        <input
          type="date"
          class="absolute inset-0 opacity-0 cursor-pointer"
          value={inputDateValue()}
          onInput={handleDateInput}
          min={getVictorianISODate(props.earliestDate)}
          max={getVictorianISODate(new Date())}
        />
        <div class="ml-2 text-slate-400 group-hover:text-orange-500 transition-colors">
          <CalendarIcon />
        </div>
      </div>

      {/* Next button */}
      <button
        type="button"
        onClick={handleNext}
        disabled={isToday()}
        class="p-2 rounded-xl text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
        title="Next Day"
      >
        <ChevronRight />
      </button>

      {/* Live Toggle */}
      <div class="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />

      <button
        type="button"
        onClick={() => props.onDateChange(null)}
        class={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-300",
          props.selectedDate === null
            ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
            : "text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10",
        )}
      >
        <div
          class={cn(
            "w-2 h-2 rounded-full animate-pulse",
            props.selectedDate === null ? "bg-white" : "bg-slate-400",
          )}
        />
        LIVE
      </button>
    </div>
  );
}

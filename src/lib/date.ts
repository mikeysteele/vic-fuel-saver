const VIC_TIMEZONE = "Australia/Melbourne";

/**
 * Returns the YYYY-MM-DD date part of a timestamp in Victorian Time.
 * Essential for comparing date picker values to sync dates correctly.
 */
export function getVictorianISODate(
  date: Date | string | null,
): string | undefined {
  if (!date) return undefined;
  const d = typeof date === "string" ? new Date(date) : date;

  // Format as YYYY-MM-DD in Melb timezone
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: VIC_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);

  const getPart = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
}

export function getVictorianDisplayDate(date: Date | string | null): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-AU", {
    timeZone: VIC_TIMEZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

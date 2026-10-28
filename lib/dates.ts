// Post dates are calendar days ("2026-10-28"), which parse as UTC midnight.
// Formatting in UTC keeps them from shifting a day on machines west of UTC.
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "2026-10-28" -> "28 October 2026" */
export function formatDate(isoDate: string): string {
  return dateFormat.format(new Date(isoDate));
}

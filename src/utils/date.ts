const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

/**
 * Deterministic date formatting that produces the exact same output
 * on Node SSR, Windows Chrome, iOS Safari, and Android Chrome.
 * Avoids any React hydration mismatch errors.
 */
export function formatStaticDate(dateString: string): string {
  if (!dateString) return "";
  try {
    const parts = dateString.split("-");
    if (parts.length >= 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day) && month >= 1 && month <= 12) {
        return `${MONTH_NAMES[month - 1]} ${day}, ${year}`;
      }
    }
    return dateString;
  } catch {
    return dateString;
  }
}

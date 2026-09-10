/**
 * Domain rule: a duration string of "00:00:00" is the sentinel our data
 * sources use for "no duration recorded", not an actual zero-length game.
 * This is a business rule (not presentation formatting), so it lives in
 * the domain rather than a UI-facing utils file.
 */
const NO_DURATION_SENTINEL = "00:00:00";

export function isMeaningfulDuration(value: string | undefined): value is string {
    return typeof value === "string" && value !== NO_DURATION_SENTINEL;
}

// Convert a time string in the format "HH:MM:SS" to total seconds
export function timeToSeconds(timeStr: string | undefined): number {
  if (!timeStr) return 0;
  const [h, m, s] = timeStr.split(':').map(Number);
  return h * 3600 + m * 60 + s;
}
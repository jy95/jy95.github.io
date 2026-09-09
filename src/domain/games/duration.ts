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
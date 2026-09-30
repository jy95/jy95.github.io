import type { Duration } from "./types";

export function stringifyJSON(payload: unknown): string {
    return JSON.stringify(payload, (_key: string, value: unknown) => {
        if (value === null) {
            return undefined;
        }
        if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
            // Database JSON fields are decoded here; malformed JSON must still throw.
            return JSON.parse(value);
        }
        return value;
    }, "\t");
}

export function normaliazeDuration(duration?: Duration): Duration {

    // If the duration is undefined or null, return a default Duration object with all values set to 0
    if (!duration) {
        return {
            hours: 0,
            minutes: 0,
            seconds: 0
        }
    }

    // Turn it into seconds
    let totalInSeconds = [
        duration.hours * 3600,
        duration.minutes * 60,
        duration.seconds
    ].reduce( (acc, total) => acc + total, 0);

    // Time to normalize the result
    const new_hours = Math.floor(totalInSeconds / 3600);
    totalInSeconds %= 3600;
    const new_minutes = Math.floor(totalInSeconds / 60);
    const new_seconds = totalInSeconds % 60;

    return {
        hours: new_hours,
        minutes: new_minutes,
        seconds : new_seconds
    }

}

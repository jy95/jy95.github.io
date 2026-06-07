import type { Duration } from "./types";

export function stringifyJSON(payload: any): string {

    function parseIfJsonString(value : any) {
        if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
            let parsedValue = value; // Initialize with original value (default return on failure)
            let success = false;

            try {
                parsedValue = JSON.parse(value);
                success = true;
            } finally {
                // The finally block executes regardless of whether JSON.parse succeeded or threw an error.
                
                // To maintain the original specification:
                // - If parsing succeeded (success === true), parsedValue holds the object/array.
                // - If parsing failed, execution jumps immediately to finally, and parsedValue 
                //   still holds the original 'value' (since 'success' is false).
                if (success) {
                    return parsedValue;
                }
                // If we reach here and 'success' is false, the function proceeds to the 
                // final return statement which returns the original 'value'.
            }
        }
        // Returns the original value if it wasn't a string, didn't start with '{' or '[', 
        // or if the JSON.parse failed and 'success' was false.
        return value;
    }

    return JSON.stringify(payload, function(_key: string, value: any) {
        if (value === null) {
            // Exclude null values
            return undefined;
        }
        return parseIfJsonString(value);
    }, "\t");
}

export function normaliazeDuration(duration: Duration): Duration {

    // Turn it into seconds
    let totalInSeconds = [
        duration.hours * 3600,
        duration.minutes * 60,
        duration.seconds
    ].reduce( (acc, total) => acc + total, 0);

    // Time to normalize the result
    let new_hours = Math.floor(totalInSeconds / 3600);
    totalInSeconds %= 3600;
    let new_minutes = Math.floor(totalInSeconds / 60);
    let new_seconds = totalInSeconds % 60;

    return {
        hours: new_hours,
        minutes: new_minutes,
        seconds : new_seconds
    }

}
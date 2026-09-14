import type {Duration, LlmContextData} from "./types";

const safeNumber = (value: number | undefined): number =>
    typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : 0;

const formatDuration = (duration: Duration | undefined): string => {
    const value = duration ?? {};
    return `${safeNumber(value.hours)} hours ${safeNumber(value.minutes)} minutes ${safeNumber(value.seconds)} seconds`;
};

export function renderCatalog({stats, backlog, planning}: LlmContextData): string {
    const general = stats.general;

    return `## Current catalog

- Published games: ${safeNumber(general?.games?.total_available)}
- Available walkthrough duration: ${formatDuration(general?.duration?.total_available)}
- Total catalog duration: ${formatDuration(general?.duration?.total)}
- Backlog candidates: ${backlog.length}
- Planned items: ${planning.length}`;
}

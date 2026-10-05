import type { SeriesSort, SeriesSummary } from "./types";

export const SERIES_SORT_OPTIONS = ["nameAsc", "nameDesc", "countDesc", "countAsc"] as const satisfies readonly SeriesSort[];

export function compareSeries(first: SeriesSummary, second: SeriesSummary, sort: SeriesSort): number {
    const idOrder = String(first.id).localeCompare(String(second.id));
    const nameOrder = first.name.localeCompare(second.name) || idOrder;
    if (sort === "nameDesc") return second.name.localeCompare(first.name) || idOrder;
    if (sort === "countAsc") return first.gamesCount - second.gamesCount || nameOrder;
    if (sort === "countDesc") return second.gamesCount - first.gamesCount || nameOrder;
    return nameOrder;
}

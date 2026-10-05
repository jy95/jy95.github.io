import { buildCardEntry } from "@/domain/games";
import { COVER_PATHS } from "@/domain/games/coverPaths";
import type { RawSeries, SeriesSummary, SeriesDetail } from "@/domain/series/types";

export async function loadSeries(): Promise<RawSeries[]> {
    // JSON infers optional playlist/video properties; RawGame requires one of them.
    return (await import("./series.json")).default as RawSeries[];
}

export function toSeriesSummary(series: RawSeries): SeriesSummary {
    return { id: series.id, name: series.name, imagePath: `${COVER_PATHS.series}/${series.id}/cover.webp`, gamesCount: series.items.length };
}

export async function toSeriesDetail(series: RawSeries): Promise<SeriesDetail> {
    const tiers = (await import("../tier-lists/games/games.json")).default;
    const tierById = new Map(Object.entries(tiers).flatMap(([category, games]) => games.map(game => [game.id, category] as const)));
    return { ...toSeriesSummary(series), items: series.items.map(game => {
        const card = buildCardEntry(game, COVER_PATHS.games);
        return { ...game, ...card, tierCategory: tierById.get(card.id) ?? "tier_not_evaluated" };
    }) };
}

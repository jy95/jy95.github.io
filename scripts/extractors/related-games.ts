import { loadTierListCardGames } from "./common/games-tier-list-extractor";
import { writeJsonFile } from "./common/runExtractor";
import { loadSeriesGameLinks } from "./series";
import { getRelatedGames, buildCandidateIndex } from "@/domain/discovery/relatedGames";

import type { Database } from "better-sqlite3";
import type { CardGame } from "@/domain/games";
import type { TierListCardGame } from "./common/games-tier-list-extractor";
import type { SeriesGameLink } from "./series";
import type { TierCategoryKey as RelatedGameTier } from "@/types/tierList";
import type {
    RelatedGameEntry,
    RelatedGameResult,
    RelatedGamesMap,
    SeriesGame,
} from "@/domain/discovery/relatedGames";

function buildSeriesMap(
    entries: TierListCardGame[],
    links: SeriesGameLink[]
): Record<string, SeriesGame> {
    const cardIdByDatabaseId = new Map(
        entries.map(({ databaseId, game }) => [databaseId, game.id])
    );

    return Object.fromEntries(
        links.flatMap((link) => {
            const cardId = cardIdByDatabaseId.get(link.game);
            return cardId
                ? [[cardId, { id: String(link.series), order: link.order }]]
                : [];
        })
    );
}

function buildTierMap(entries: TierListCardGame[]): Record<string, RelatedGameTier> {
    return Object.fromEntries(entries.map(({ game, category }) => [game.id, category]));
}

function toRelatedGameEntry({ game }: RelatedGameResult): RelatedGameEntry {
    return {
        id: game.id,
        title: game.title,
        imagePath: game.imagePath,
        url: game.url,
        url_type: game.url_type,
    };
}

function buildRelatedGamesMap(
    targets: CardGame[],
    candidates: CardGame[],
    seriesMap: Record<string, SeriesGame>,
    tierMap: Record<string, RelatedGameTier>
): RelatedGamesMap {
    // Built once, outside the loop — title bigrams for every candidate are
    // computed a single time and reused across all `targets.length` calls
    // below, instead of once per target.
    const candidateIndex = buildCandidateIndex(candidates);

    return Object.fromEntries(
        targets.map((target) => [
            target.id,
            getRelatedGames(target, candidateIndex, { seriesMap, tierMap, limit: 12 }).map(
                toRelatedGameEntry
            ),
        ])
    );
}

/**
 * Precomputes "you might also like" candidates for every future game, using
 * published non-DLC games as candidates, at build time. This keeps the runtime
 * cost of the feature to a single small JSON fetch (cached client-side) plus
 * an O(1) lookup by game id — no
 * per-view scoring against the whole catalog, so it stays cheap on
 * low-end devices as the number of games grows.
 */
export async function extractAndSaveRelatedGames(db: Database, outputPath: string): Promise<void> {
    const targetEntries = loadTierListCardGames(db, "games_in_future", true);
    const candidateEntries = loadTierListCardGames(db, "games_in_present", true);
    const targets = targetEntries.map(({ game }) => game);
    const candidates = candidateEntries.map(({ game }) => game);
    const seriesMap = buildSeriesMap(
        [...targetEntries, ...candidateEntries],
        loadSeriesGameLinks(db)
    );
    const tierMap = buildTierMap(candidateEntries);
    const result = buildRelatedGamesMap(targets, candidates, seriesMap, tierMap);

    await writeJsonFile(outputPath, result);
}

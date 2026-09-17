import { loadTierListCardGames } from "./common/games-tier-list-extractor";
import { writeJsonFile } from "./common/runExtractor";
import { loadSeriesGameLinks } from "./series";
import { getRelatedGames } from "@/domain/discovery/relatedGames";

import type { Database } from "better-sqlite3";
import type { TierCategoryKey as RelatedGameTier } from '@/types/tierList';
import type {
    RelatedGamesMap,
    SeriesGame,
} from "@/domain/discovery/relatedGames";

/**
 * Precomputes "you might also like" candidates for every published game at
 * build time. This keeps the runtime cost of the feature to a single small
 * JSON fetch (cached client-side) plus an O(1) lookup by game id — no
 * per-view scoring against the whole catalog, so it stays cheap on
 * low-end devices as the number of games grows.
 */
export async function extractAndSaveRelatedGames(db: Database, outputPath: string): Promise<void> {
    const targetEntries = loadTierListCardGames(db, "games_in_future", true);
    const candidateEntries = loadTierListCardGames(db, "games_in_present", true);
    const targets = targetEntries.map(({ game }) => game);
    const candidates = candidateEntries.map(({ game }) => game);
    const numericIdToCardId = new Map(
        [...targetEntries, ...candidateEntries].map(({ databaseId, game }) => [databaseId, game.id])
    );
    const tierMap = Object.fromEntries(
        candidateEntries.map(({ game, category }) => [game.id, category])
    ) as Record<string, RelatedGameTier>;

    const seriesMap: Record<string, SeriesGame> = {};
    for (const link of loadSeriesGameLinks(db)) {
        const cardId = numericIdToCardId.get(link.game);
        if (cardId) {
            seriesMap[cardId] = {
                id: String(link.series),
                order: link.order,
            };
        }
    }

    const result: RelatedGamesMap = {};
    for (const game of targets) {
        const related = getRelatedGames(game, candidates, { seriesMap, tierMap, limit: 12 });
        result[game.id] = related.map(({ game: relatedGame }) => ({
            id: relatedGame.id,
            title: relatedGame.title,
            imagePath: relatedGame.imagePath,
            url: relatedGame.url,
            url_type: relatedGame.url_type,
        }));
    }

    await writeJsonFile(outputPath, result);
}

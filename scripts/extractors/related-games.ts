import { writeFile } from "node:fs/promises";
import { stringifyJSON } from "./common/utils";
import { buildCardGame } from "@/domain/games";
import { COVER_PATHS } from "@/domain/games/coverPaths";
import { getRelatedGames } from "@/domain/discovery/relatedGames";

import type { Database } from "better-sqlite3";
import type { BasicGame, CardGame } from "@/domain/games";

import type { TierCategoryKey as RelatedGameTier } from '@/types/tierList';
import type {
    RelatedGamesMap,
    SeriesGame,
} from "@/domain/discovery/relatedGames";

type GameRow = BasicGame & { id: number; genres: string };
type CandidateRow = GameRow & { category_slug: RelatedGameTier };
type SeriesLinkRow = { game: number; serie: number; order: number };

const TARGETS_QUERY = `
    SELECT g.*,
        COALESCE((SELECT json_group_array(genre) FROM games_genres WHERE game = g.id), '[]') AS genres
    FROM games_in_future gif
    JOIN games g ON g.id = gif.id
    WHERE g.id NOT IN (SELECT dlc FROM games_dlcs)
    ORDER BY g.title ASC
`;

const CANDIDATES_QUERY = `
    SELECT g.*,
        COALESCE(
            (SELECT json_group_array(genre) FROM games_genres WHERE game = g.id),
            '[]'
        ) AS genres,
        COALESCE(tc.slug, 'tier_not_evaluated') AS category_slug
    FROM games_in_present g
    LEFT JOIN tier_list_games tlg ON tlg.game_id = g.id
    LEFT JOIN tier_categories tc ON tc.id = tlg.category_id
    WHERE g.id NOT IN (SELECT dlc FROM games_dlcs)
    ORDER BY g.title ASC
`;

/**
 * Precomputes "you might also like" candidates for every published game at
 * build time. This keeps the runtime cost of the feature to a single small
 * JSON fetch (cached client-side) plus an O(1) lookup by game id — no
 * per-view scoring against the whole catalog, so it stays cheap on
 * low-end devices as the number of games grows.
 */
export async function extractAndSaveRelatedGames(db: Database, outputPath: string): Promise<void> {
    const targetRows = db.prepare(TARGETS_QUERY).all() as GameRow[];
    const candidateRows = db.prepare(CANDIDATES_QUERY).all() as CandidateRow[];

    // buildCardGame overwrites the numeric db `id` with the card id
    // (videoId/playlistId), so capture the numeric -> card id mapping
    // before that happens — we need the numeric id to resolve series links.
    const numericIdToCardId = new Map<number, string>();
    const toCardGame = (row: GameRow): CardGame => {
        const { id: numericId, genres, ...rest } = row;
        const card = buildCardGame(
            { ...rest, genres: JSON.parse(genres || "[]") } as BasicGame,
            COVER_PATHS.games
        );
        numericIdToCardId.set(numericId, card.id);
        return card;
    };
    const targets = targetRows.map(toCardGame);
    const candidates = candidateRows.map(toCardGame);
    const tierMap = Object.fromEntries(
        candidateRows.map((row, index) => [candidates[index].id, row.category_slug ?? "tier_not_evaluated"])
    ) as Record<string, RelatedGameTier>;

    const seriesLinks = db.prepare(
        'SELECT game, serie, `order` AS "order" FROM series_games'
    ).all() as SeriesLinkRow[];
    const seriesMap: Record<string, SeriesGame> = {};
    for (const link of seriesLinks) {
        const cardId = numericIdToCardId.get(link.game);
        if (cardId) {
            seriesMap[cardId] = {
                id: String(link.serie),
                order: link.order,
            };
        }
    }

    const result: RelatedGamesMap = {};
    for (const game of targets) {
        const related = getRelatedGames(game, candidates, { seriesMap, tierMap, limit: 3 });
        result[game.id] = related.map(({ game: relatedGame }) => ({
            id: relatedGame.id,
            title: relatedGame.title,
            imagePath: relatedGame.imagePath,
            url: relatedGame.url,
            url_type: relatedGame.url_type,
        }));
    }

    await writeFile(outputPath, stringifyJSON(result), "utf-8");
    console.log(`${outputPath} successfully written`);
}
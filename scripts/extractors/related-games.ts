import { writeFile } from "node:fs/promises";
import { stringifyJSON } from "./common/utils";
import { buildCardGame } from "@/domain/games";
import { COVER_PATHS } from "@/domain/games/coverPaths";
import { getRelatedGames } from "@/domain/discovery/relatedGames";

import type { Database } from "better-sqlite3";
import type { BasicGame, CardGame } from "@/domain/games";
import type { RelatedGamesMap } from "@/domain/discovery/relatedGames";

type GameRow = BasicGame & { id: number; genres: string };
type SeriesLinkRow = { game: number; serie: number };

const GAMES_QUERY = `
    SELECT * FROM games_in_present
    WHERE id NOT IN (SELECT dlc FROM games_dlcs)
    ORDER BY title ASC
`;

/**
 * Precomputes "you might also like" candidates for every published game at
 * build time. This keeps the runtime cost of the feature to a single small
 * JSON fetch (cached client-side) plus an O(1) lookup by game id — no
 * per-view scoring against the whole catalog, so it stays cheap on
 * low-end devices as the number of games grows.
 */
export async function extractAndSaveRelatedGames(db: Database, outputPath: string): Promise<void> {
    const rows = db.prepare(GAMES_QUERY).all() as GameRow[];

    // buildCardGame overwrites the numeric db `id` with the card id
    // (videoId/playlistId), so capture the numeric -> card id mapping
    // before that happens — we need the numeric id to resolve series links.
    const numericIdToCardId = new Map<number, string>();
    const cardGames: CardGame[] = rows.map((row) => {
        const { id: numericId, genres, ...rest } = row;
        const card = buildCardGame(
            { ...rest, genres: JSON.parse(genres || "[]") } as BasicGame,
            COVER_PATHS.games
        );
        numericIdToCardId.set(numericId, card.id);
        return card;
    });

    const seriesLinks = db.prepare("SELECT game, serie FROM series_games").all() as SeriesLinkRow[];
    const seriesMap: Record<string, string> = {};
    for (const link of seriesLinks) {
        const cardId = numericIdToCardId.get(link.game);
        if (cardId) seriesMap[cardId] = String(link.serie);
    }

    const result: RelatedGamesMap = {};
    for (const game of cardGames) {
        const related = getRelatedGames(game, cardGames, { seriesMap, limit: 3 });
        result[game.id] = related.map(({ game: relatedGame, reason }) => ({
            id: relatedGame.id,
            title: relatedGame.title,
            imagePath: relatedGame.imagePath,
            url: relatedGame.url,
            url_type: relatedGame.url_type,
            reason,
        }));
    }

    await writeFile(outputPath, stringifyJSON(result), "utf-8");
    console.log(`${outputPath} successfully written`);
}
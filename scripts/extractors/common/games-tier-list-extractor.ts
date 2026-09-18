import { writeJsonFile } from "./runExtractor";
import { buildCardGame } from "@/domain/games";
import { COVER_PATHS } from "@/domain/games/coverPaths";

import type { Database } from "better-sqlite3";
import type { BasicGame, CardGame } from "@/domain/games";
import type { TierCategoryKey as RelatedGameTier } from "@/types/tierList";

type GameRow = BasicGame & {
    id: number;
    genres: string;
    category_slug: RelatedGameTier;
};

export type TierListCardGame = {
    databaseId: number;
    game: CardGame;
    category: RelatedGameTier;
};

type TierListResult = Record<string, CardGame[]>;

export function loadTierListCardGames(
    db: Database,
    gamesTableName: "games_in_present" | "games_in_future",
    includeGenres = false
): TierListCardGame[] {
    const rows = db.prepare(`
    SELECT g.*,
        COALESCE((SELECT json_group_array(genre) FROM games_genres WHERE game = g.id), '[]') AS genres,
        COALESCE(tc.slug, 'tier_not_evaluated') AS category_slug
    FROM ${gamesTableName} selected_games
    JOIN games g ON selected_games.id = g.id
    LEFT JOIN tier_list_games tlg ON g.id = tlg.game_id
    LEFT JOIN tier_categories tc ON tlg.category_id = tc.id
    WHERE g.id NOT IN (SELECT dlc FROM games_dlcs) 
    ORDER BY g.title ASC
    `).all() as GameRow[];

    return rows.map(({ id, genres, category_slug, ...gameData }) => {
        const cardSource = includeGenres
            ? { ...gameData, genres: JSON.parse(genres || "[]") }
            : gameData;
        return {
            databaseId: id,
            game: buildCardGame(cardSource as BasicGame, COVER_PATHS.games),
            category: category_slug,
        };
    });
}

export async function genericExtractAndSaveTierListGames(
    db: Database,
    outputPath: string,
    gamesTableName: "games_in_present" | "games_in_future"
): Promise<void> {
    const categories = db.prepare('SELECT slug FROM tier_categories ORDER BY display_order ASC').all() as { slug: string }[];

    const result: TierListResult = {};

    for (const cat of categories) {
        result[cat.slug] = [];
    }

    for (const { category, game } of loadTierListCardGames(db, gamesTableName)) {
        result[category].push(game);
    }

    await writeJsonFile(outputPath, result);
}

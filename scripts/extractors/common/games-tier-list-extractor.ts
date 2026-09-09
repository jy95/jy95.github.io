import { writeFile } from "fs/promises";
import { stringifyJSON } from "./utils";
import { buildCardGame } from "@/domain/games";

import type { Database } from "better-sqlite3";
import type { BasicGame, CardGame } from "@/domain/games";

type GameRow = BasicGame & {
    category_slug: string;
};

type TierListResult = Record<string, CardGame[]>;

// Queries
const gamesInPresentQuery = `
    SELECT g.*, COALESCE(tc.slug, 'tier_not_evaluated') AS category_slug
    FROM games_in_present g
    LEFT JOIN tier_list_games tlg ON g.id = tlg.game_id
    LEFT JOIN tier_categories tc ON tlg.category_id = tc.id
    WHERE g.id NOT IN (SELECT dlc FROM games_dlcs) 
    ORDER BY g.title ASC
`;
const gamesInFutureQuery = `
    SELECT g.*, COALESCE(tc.slug, 'tier_not_evaluated') AS category_slug
    FROM games_in_future gf 
    LEFT JOIN tier_list_games tlg ON gf.id = tlg.game_id 
    LEFT JOIN tier_categories tc ON tlg.category_id = tc.id 
    JOIN games g ON gf.id = g.id
    WHERE g.id NOT IN (SELECT dlc FROM games_dlcs) 
    ORDER BY g.title ASC
`;

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

    const query = (gamesTableName === "games_in_present") 
        ? gamesInPresentQuery 
        : gamesInFutureQuery;

    const rows = db.prepare(query).all() as GameRow[];

    for (const row of rows) {
        const { category_slug, ...gameData } = row;
        result[category_slug].push(buildCardGame(gameData, "/covers"));
    }

    await writeFile(outputPath, stringifyJSON(result), "utf-8");
    console.log(`${outputPath} successfully written`);
}
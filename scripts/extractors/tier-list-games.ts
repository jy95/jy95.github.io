import { writeFile } from "fs/promises";
import { stringifyJSON } from "./common/utils";

import type { Database } from "better-sqlite3";

import type { 
    BasicGame,
    CardGame,
    BasicPlaylist,
    BasicVideo,
    YTUrlType
} from "@/redux/sharedDefintion";

// SQL query result type for games in tier list with their category slug
type GameRow = BasicGame & {
    category_slug: string;
};

// Type pour le dictionnaire final de la Tier List
type TierListResult = Record<string, CardGame[]>;

export async function extractAndSaveTierListGames(db: Database, outputPath: string): Promise<void> {

    // Explicit typing of the SQLite query result ({ slug: string }[])
    const categories = db.prepare('SELECT slug FROM tier_categories ORDER BY display_order ASC').all() as { slug: string }[];
    
    // Setup data structure with empty arrays for each category + a default "not evaluated" category
    const result: TierListResult = {};
    
    for (const cat of categories) {
        result[cat.slug] = [];
    }

    // 2. Fetch games with their category slug in one query
    const rows = db.prepare(`
        SELECT g.*, COALESCE(tc.slug, 'tier_not_evaluated') AS category_slug
        FROM games_in_present g
        LEFT JOIN tier_list_games tlg ON g.id = tlg.game_id
        LEFT JOIN tier_categories tc ON tlg.category_id = tc.id
        WHERE g.id NOT IN (SELECT dlc FROM games_dlcs)
    `).all() as GameRow[];

    // 3. Fill the result object
    for (const row of rows) {

        const { category_slug, ...gameData } = row;
        result[category_slug].push(mapToCardGame(gameData));

    }

    await writeFile(
        outputPath,
        stringifyJSON(result),
        "utf-8"
    );
    console.log(`${outputPath} successfully written`);
}

function mapToCardGame(game: BasicGame): CardGame {
    const id = (game as BasicPlaylist).playlistId ?? (game as BasicVideo).videoId;
    const base_url = ("playlistId" in game)
        ? `https://www.youtube.com/playlist?list=${id}`
        : `https://www.youtube.com/watch?v=${id}`;
    const url_type: YTUrlType = ("playlistId" in game) ? "PLAYLIST" : "VIDEO";

    return {
        ...game,
        id,
        imagePath: `/covers/${id}/${game.coverFile ?? "cover.webp"}`,
        url: base_url,
        url_type: url_type
    };
}
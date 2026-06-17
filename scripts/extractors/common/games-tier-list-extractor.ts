import { writeFile } from "fs/promises";
import { stringifyJSON } from "./utils";

import type { Database } from "better-sqlite3";
import type { BasicGame, CardGame, BasicPlaylist, BasicVideo, YTUrlType } from "@/redux/sharedDefintion";

type GameRow = BasicGame & {
    category_slug: string;
};

type TierListResult = Record<string, CardGame[]>;

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

    const rows = db.prepare(`
        SELECT g.*, COALESCE(tc.slug, 'tier_not_evaluated') AS category_slug
        FROM ${gamesTableName} g
        LEFT JOIN tier_list_games tlg ON g.id = tlg.game_id
        LEFT JOIN tier_categories tc ON tlg.category_id = tc.id
        WHERE g.id NOT IN (SELECT dlc FROM games_dlcs) 
        ORDER BY g.title ASC
    `).all() as GameRow[];

    for (const row of rows) {
        const { category_slug, ...gameData } = row;
        result[category_slug].push(mapToCardGame(gameData));
    }

    await writeFile(outputPath, stringifyJSON(result), "utf-8");
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
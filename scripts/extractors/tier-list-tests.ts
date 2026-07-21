import { writeFile } from "fs/promises";
import { stringifyJSON } from "./common/utils";

import type { Database } from "better-sqlite3";

import type { BasicPlaylist, BasicVideo, CardGame, YTUrlType } from "@/redux/sharedDefintion";

type tierListTestsEntry = Omit<CardGame, "id" | "imagePath" | "url" | "url_type"> & {
    category_slug: string;
};

type TierListResult = Record<string, CardGame[]>;

export async function extractAndSaveTierListTests(db: Database, outputPath: string): Promise<void> {

    // Explicit typing of the SQLite query result ({ slug: string }[])
    const categories = db.prepare('SELECT slug FROM tier_categories ORDER BY display_order ASC').all() as { slug: string }[];   

    // Setup data structure with empty arrays for each category + a default "not evaluated" category
    const result: TierListResult = {};

    for (const cat of categories) {
        result[cat.slug] = [];
    }

    // 2. Fetch games with their category slug in one query
    const rows = db.prepare(`
        SELECT t.*, COALESCE(tc.slug, 'tier_not_evaluated') AS category_slug 
        FROM tests t  
        LEFT JOIN tier_list_tests tlt ON t.id = tlt.test_id
        LEFT JOIN tier_categories tc ON tlt.category_id = tc.id 
        ORDER BY t.title ASC
    `).all() as tierListTestsEntry[];

    // 3. Fill the result object
    for (const row of rows) {
        const { category_slug } = row;
        result[category_slug].push(mapToResult(row));
    }

    await writeFile(
        outputPath,
        stringifyJSON(result),
        "utf-8"
    );
    console.log(`${outputPath} successfully written`);
}

function mapToResult(entry: tierListTestsEntry): CardGame {
    const { category_slug: _categorySlug, ...cardGame } = entry;
    
    const id = (cardGame as BasicPlaylist).playlistId ?? (cardGame as BasicVideo).videoId;
    const base_url = ("playlistId" in cardGame)
            ? `https://www.youtube.com/playlist?list=${id}`
            : `https://www.youtube.com/watch?v=${id}`;
    const url_type: YTUrlType = ("playlistId" in cardGame) ? "PLAYLIST" : "VIDEO";

    return { 
        ...cardGame,
        id: id,
        imagePath: `/testscovers/${id}/cover.webp`,
        url: base_url,
        url_type: url_type
    };
}
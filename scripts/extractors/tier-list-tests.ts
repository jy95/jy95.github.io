import { writeFile } from "fs/promises";
import { stringifyJSON } from "./common/utils";
import { buildCardEntry } from "@/redux/sharedDefintion";

import type { Database } from "better-sqlite3";
import type { RawGame, CardGame } from "@/redux/sharedDefintion";

/**
 * Previously typed as `Omit<CardGame, "id" | "imagePath" | "url" | "url_type">`,
 * even though the actual SQL row (and the code below) reached for
 * `playlistId`/`videoId` via `as BasicPlaylist`/`as BasicVideo` casts —
 * fields that don't exist on `CardGame` at all. `RawGame` (the same type
 * `buildCardEntry` expects, already used by the `tests` and `dlcs` API
 * routes) matches what a raw `tests` table row actually looks like.
 */
type tierListTestsEntry = RawGame & {
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

/**
 * Same rationale as `games-tier-list-extractor.ts::mapToCardGame`: reuse the
 * single `buildCardEntry` narrowing helper instead of re-deriving
 * id/url/url_type from `playlistId`/`videoId` presence locally.
 */
function mapToResult(entry: tierListTestsEntry): CardGame {
    const { category_slug: _categorySlug, ...game } = entry;
    return {
        ...game,
        ...buildCardEntry(game, "/testscovers")
    };
}
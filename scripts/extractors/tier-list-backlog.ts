import { writeFile } from "fs/promises";
import { stringifyJSON } from "./common/utils";

import type { Database } from "better-sqlite3";

import type { BacklogEntry } from "@/app/api/backlog/route";

type TierListBacklogEntry = Omit<BacklogEntry, "imagePath" | "url" | "url_type"> & {
    category_slug: string;
};

type TierListResult = Record<string, BacklogEntry[]>;

export async function extractAndSaveTierListBacklog(db: Database, outputPath: string): Promise<void> {

    // Explicit typing of the SQLite query result ({ slug: string }[])
    const categories = db.prepare('SELECT slug FROM tier_categories ORDER BY display_order ASC').all() as { slug: string }[];

    // Setup data structure with empty arrays for each category + a default "not evaluated" category
    const result: TierListResult = {};

    for (const cat of categories) {
        result[cat.slug] = [];
    }

    // 2. Fetch games with their category slug in one query
    const rows = db.prepare(`
        SELECT b.*, COALESCE(tc.slug, 'tier_not_evaluated') AS category_slug
        FROM backlog b
        LEFT JOIN tier_list_backlog tlb ON b.id = tlb.backlog_id
        LEFT JOIN tier_categories tc ON tlb.category_id = tc.id 
        ORDER BY b.title ASC
    `).all() as TierListBacklogEntry[];

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

function mapToResult(entry: TierListBacklogEntry): BacklogEntry {
    return { 
        ...entry,
        id: entry.id.toString(),
        imagePath: `/backlogcovers/${entry.id}/cover.webp`
    };
}

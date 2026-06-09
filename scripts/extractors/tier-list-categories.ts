import { writeFile } from "fs/promises";
import { stringifyJSON } from "./common/utils";

import type { Database } from "better-sqlite3";

type TierListCategory = {
    id: number;
    slug: string;
    name: string;
};

export async function extractAndSaveTierListCategories(db: Database, outputPath: string): Promise<void> {
    // In case two categories have the same display order, we sort them by id to ensure a consistent order
    const categories = db.prepare('SELECT id, slug, display_order FROM tier_categories ORDER BY display_order ASC, id ASC').all() as TierListCategory[];
    await writeFile(outputPath, stringifyJSON(categories));
}
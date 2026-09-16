import { writeFile } from "node:fs/promises";
import type { Database } from "better-sqlite3";
import { stringifyJSON } from "../common/utils";

interface TierCategory {
  slug: string;
}

interface BaseTierEntry {
  category_slug: string;
}

/**
 * Generic helper to fetch tier categories, execute a SQL query, 
 * map database rows into target objects, and write out a JSON file.
 */
export async function extractAndSaveTierList<
  TRow extends BaseTierEntry,
  TResult
>(
  db: Database,
  outputPath: string,
  query: string,
  mapFn: (row: TRow) => TResult
): Promise<void> {
  // 1. Fetch categories to pre-populate keys
  const categories = db
    .prepare("SELECT slug FROM tier_categories ORDER BY display_order ASC")
    .all() as TierCategory[];

  const result: Record<string, TResult[]> = Object.fromEntries(
    categories.map((cat) => [cat.slug, []])
  );

  // 2. Execute query
  const rows = db.prepare(query).all() as TRow[];

  // 3. Group and map items into categories
  for (const row of rows) {
    const { category_slug } = row;
    if (!result[category_slug]) {
      result[category_slug] = [];
    }
    result[category_slug].push(mapFn(row));
  }

  // 4. Persist to disk
  await writeFile(outputPath, stringifyJSON(result), "utf-8");
  console.log(`${outputPath} successfully written`);
}
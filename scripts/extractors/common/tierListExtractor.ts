import { writeFile } from "node:fs/promises";
import type { Database } from "better-sqlite3";
import { stringifyJSON } from "./utils";

interface TierCategory {
  slug: string;
}

interface BaseTierEntry {
  category_slug: string;
}

export async function extractAndSaveTierList<
  TRow extends BaseTierEntry,
  TResult
>(
  db: Database,
  outputPath: string,
  query: string,
  mapFn: (row: TRow) => TResult
): Promise<void> {
  const categories = db
    .prepare("SELECT slug FROM tier_categories ORDER BY display_order ASC")
    .all() as TierCategory[];

  const result: Record<string, TResult[]> = Object.fromEntries(
    categories.map((cat) => [cat.slug, []])
  );

  const rows = db.prepare(query).all() as TRow[];

  for (const row of rows) {
    const { category_slug } = row;
    if (!result[category_slug]) {
      result[category_slug] = [];
    }
    result[category_slug].push(mapFn(row));
  }

  await writeFile(outputPath, stringifyJSON(result), "utf-8");
  console.log(`${outputPath} successfully written`);
}

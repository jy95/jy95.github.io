import { readFile } from "node:fs/promises";
import Database from "better-sqlite3";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { tempOutputPath } from "./testFileHelper";
import { extractAndSaveTierList } from "./tierListExtractor";

interface TierRow {
  category_slug: string;
  id: number;
  title: string;
}

describe("extractAndSaveTierList", () => {
  const output = tempOutputPath("tier-list-extractor");
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(":memory:");
    db.exec(`
      CREATE TABLE tier_categories (
        slug TEXT NOT NULL,
        display_order INTEGER NOT NULL
      );
      CREATE TABLE entries (
        id INTEGER NOT NULL,
        title TEXT NOT NULL,
        category_slug TEXT NOT NULL
      );
      INSERT INTO tier_categories VALUES ('high', 1), ('low', 2);
      INSERT INTO entries VALUES
        (1, 'First', 'high'),
        (2, 'Unrated', 'tier_not_evaluated');
    `);
    vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(() => {
    db.close();
    output.cleanup();
    vi.restoreAllMocks();
  });

  it("pre-populates ordered categories and groups mapped rows", async () => {
    await extractAndSaveTierList<TierRow, { id: string; title: string }>(
      db,
      output.path,
      "SELECT * FROM entries ORDER BY id",
      ({ id, title }) => ({ id: String(id), title })
    );

    const result = JSON.parse(await readFile(output.path, "utf-8")) as Record<
      string,
      unknown[]
    >;

    expect(Object.keys(result)).toEqual([
      "high",
      "low",
      "tier_not_evaluated",
    ]);
    expect(result).toEqual({
      high: [{ id: "1", title: "First" }],
      low: [],
      tier_not_evaluated: [{ id: "2", title: "Unrated" }],
    });
  });
});

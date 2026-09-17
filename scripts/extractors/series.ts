import { writeFile } from "node:fs/promises";
import { stringifyJSON } from "./common/utils";

import type { Database } from "better-sqlite3";

export type SeriesGameLink = { game: number; series: number; order: number };

export function loadSeriesGameLinks(db: Database): SeriesGameLink[] {
    return db.prepare(
        'SELECT game, serie AS series, `order` AS "order" FROM series_games ORDER BY serie, `order`, game'
    ).all() as SeriesGameLink[];
}

/**
 * Extracts series from the database and saves them to a file.
 */
export async function extractAndSaveSeries(db: Database, outputPath: string): Promise<void> {
    const extractSeriesStmt = db.prepare("SELECT * FROM series_as_json");
    const series = extractSeriesStmt.all();
    await writeFile(
        outputPath,
        stringifyJSON(series),
        "utf-8"
    );
    console.log(`${outputPath} successfully written`);
}

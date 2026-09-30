import { extractAndSaveQuery } from "./common/runExtractor";

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
export const extractAndSaveSeries = (db: Database, outputPath: string) =>
    extractAndSaveQuery(db, outputPath, "SELECT * FROM series_as_json");

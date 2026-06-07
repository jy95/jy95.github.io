import { writeFile } from "fs/promises";
import { stringifyJSON } from "./common/utils";

import type { Database } from "better-sqlite3";

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
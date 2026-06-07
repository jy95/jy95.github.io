import { writeFile } from "fs/promises";
import { stringifyJSON } from "./common/utils";

import type { Database } from "better-sqlite3";

/**
 * Extracts genres from the database and saves them to a file.
 */
export async function extractAndSaveGenres(db: Database, outputPath: string): Promise<void> {
    const extractGenresStmt = db.prepare("SELECT id, name FROM genres");
    const genres = extractGenresStmt.all();
    await writeFile(
        outputPath,
        stringifyJSON(genres),
        "utf-8"
    );
    console.log(`${outputPath} successfully written`);
}
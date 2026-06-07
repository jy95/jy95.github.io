import { writeFile } from "fs/promises";
import { stringifyJSON } from "./common/utils";

import type { Database } from "better-sqlite3";

/**
 * Extracts platforms from the database and saves them to a file.
 */
export async function extractAndSavePlatforms(db: Database, outputPath: string): Promise<void> {
    const extractPlatformsStmt = db.prepare("SELECT id, name FROM platforms");
    const platforms = extractPlatformsStmt.all();
    await writeFile(
        outputPath,
        stringifyJSON(platforms),
        "utf-8"
    );
    console.log(`${outputPath} successfully written`);
}
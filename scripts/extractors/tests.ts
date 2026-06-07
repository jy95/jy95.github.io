import { writeFile } from "fs/promises";
import { stringifyJSON } from "./common/utils";

import type { Database } from "better-sqlite3";

/**
 * Extracts tests from the database and saves them to a file.
 */
export async function extractAndSaveTests(db: Database, outputPath: string): Promise<void> {
    const extractTestsStmt = db.prepare("SELECT title, videoId, playlistId, platform FROM tests");
    const tests = extractTestsStmt.all();
    await writeFile(
        outputPath,
        stringifyJSON(tests),
        "utf-8"
    );
    console.log(`${outputPath} successfully written`);
}
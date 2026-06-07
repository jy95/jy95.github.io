import { writeFile } from "fs/promises";
import { stringifyJSON } from "./common/utils";

import type { Database } from "better-sqlite3";

/**
 * Extracts backlog from the database and saves them to a file.
 */
export async function extractAndSaveBacklog(db: Database, outputPath: string): Promise<void> {
    const extractBacklogStmt = db.prepare("SELECT * FROM backlog");
    const backlog = extractBacklogStmt.all();
    await writeFile(
        outputPath,
        stringifyJSON(backlog),
        "utf-8"
    );
    console.log(`${outputPath} successfully written`);
}
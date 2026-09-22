import { writeFile } from "node:fs/promises";
import { stringifyJSON } from "./common/utils";

import type { Database } from "better-sqlite3";

/**
 * Extracts planning from the database and saves them to a file.
 */
export async function extractAndSavePlanning(db: Database, outputPath: string): Promise<void> {
    const extractPlanningStmt = db.prepare(`SELECT * FROM games_in_future`);
    const planning = extractPlanningStmt.all();
    await writeFile(
        outputPath,
        stringifyJSON(planning),
        "utf-8"
    );
    console.log(`${outputPath} successfully written`);
}
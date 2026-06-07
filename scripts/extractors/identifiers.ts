import { writeFile } from "fs/promises";
import { stringifyJSON } from "./common/utils";

import type { Database } from "better-sqlite3";

/**
 * Extracts game identifiers from the database and saves them to a file.
 */
export async function extractAndSaveRandomList(db: Database, outputPath: string): Promise<void> {
    // We can pick up also DLC to have a complete list
    const extractGamesList = db.prepare("SELECT videoId, playlistId FROM games_in_present");
    const games = extractGamesList.all();
    await writeFile(
        outputPath,
        stringifyJSON(games),
        "utf-8"
    );
    console.log(`${outputPath} successfully written`);
}
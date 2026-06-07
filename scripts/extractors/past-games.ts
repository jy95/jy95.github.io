import { writeFile } from "fs/promises";
import { stringifyJSON } from "./common/utils";

import type { Database } from "better-sqlite3";

/**
 * Extracts games from the database and saves them to a file.
 */
export async function extractAndSavePastGames(db: Database, outputPath: string): Promise<void> {
    const extractGamesList = db.prepare("SELECT * FROM games_in_past");
    const gamesList = extractGamesList.all();
    await writeFile(
        outputPath,
        stringifyJSON(gamesList),
        "utf-8"
    );
    console.log(`${outputPath} successfully written`);    
}
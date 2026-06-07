import { writeFile } from "fs/promises";
import { stringifyJSON } from "./common/utils";

import type { Database } from "better-sqlite3";

/**
 * Extracts planning from the database and saves them to a file.
 */
export async function extractAndSavePlanning(db: Database, outputPath: string): Promise<void> {
    const extractPlanningStmt = db.prepare(`
        SELECT 
            gif.*, 
            g.*,
            COALESCE(
                (SELECT json_group_array(genre) 
                 FROM games_genres 
                 WHERE game = g.id), 
            '[]') as genres
        FROM games_in_future gif 
        INNER JOIN games g ON g.id = gif.id
    `);
    const planning = extractPlanningStmt.all();
    await writeFile(
        outputPath,
        stringifyJSON(planning),
        "utf-8"
    );
    console.log(`${outputPath} successfully written`);
}
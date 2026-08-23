import { extractAndSaveQuery } from "./common/runExtractor";
import type { Database } from "better-sqlite3";

/**
 * Extracts game identifiers from the database and saves them to a file.
 */
export const extractAndSaveRandomList = (db: Database, outputPath: string) => 
    extractAndSaveQuery(db, outputPath, "SELECT videoId, playlistId FROM games_in_present");
import { extractAndSaveQuery } from "./common/runExtractor";
import type { Database } from "better-sqlite3";

/**
 * Extracts tests from the database and saves them to a file.
 */
export const extractAndSaveTests = (db: Database, outputPath: string) =>
    extractAndSaveQuery(db, outputPath, "SELECT title, videoId, playlistId, platform FROM tests");
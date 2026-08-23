import { extractAndSaveQuery } from "./common/runExtractor";
import type { Database } from "better-sqlite3";

/**
 * Extracts backlog from the database and saves them to a file.
 */
export const extractAndSaveBacklog = (db: Database, outputPath: string) =>
    extractAndSaveQuery(db, outputPath, "SELECT * FROM backlog");
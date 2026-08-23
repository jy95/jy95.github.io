import { extractAndSaveQuery } from "./common/runExtractor";
import type { Database } from "better-sqlite3";

/**
 * Extracts genres from the database and saves them to a file.
 */
export const extractAndSaveGenres = (db: Database, outputPath: string) =>
    extractAndSaveQuery(db, outputPath, "SELECT id, name FROM genres");
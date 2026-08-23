import { extractAndSaveQuery } from "./common/runExtractor";
import type { Database } from "better-sqlite3";

/**
 * Extracts dlcs from the database and saves them to a file.
 */
export const extractAndSaveDLCS = (db: Database, outputPath: string) =>
    extractAndSaveQuery(db, outputPath, "SELECT * FROM dlcs_as_json");
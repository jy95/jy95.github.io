import { extractAndSaveQuery } from "./common/runExtractor";
import type { Database } from "better-sqlite3";

export const extractAndSaveCompanies = (db: Database, outputPath: string) =>
    extractAndSaveQuery(db, outputPath, "SELECT * FROM companies_games_as_json");

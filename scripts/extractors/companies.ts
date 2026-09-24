import { writeFile } from "node:fs/promises";
import { stringifyJSON } from "./common/utils";
import type { Database } from "better-sqlite3";

export async function extractAndSaveCompanies(db: Database, outputPath: string): Promise<void> {
    const companies = db.prepare("SELECT * FROM companies_games_as_json").all();
    await writeFile(outputPath, stringifyJSON(companies), "utf-8");
    console.log(`${outputPath} successfully written`);
}
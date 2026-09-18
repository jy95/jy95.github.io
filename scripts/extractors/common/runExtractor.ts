import { writeFile } from "node:fs/promises";
import { stringifyJSON } from "./utils";
import type { Database } from "better-sqlite3";

export async function extractAndSaveQuery(
    db: Database,
    outputPath: string,
    sql: string,
    ...params: unknown[]
): Promise<void> {
    const rows = db.prepare(sql).all(...params);
    await writeJsonFile(outputPath, rows);
}

export async function writeJsonFile(outputPath: string, payload: unknown): Promise<void> {
    await writeFile(outputPath, stringifyJSON(payload), "utf-8");
    console.log(`${outputPath} successfully written`);
}

import { writeFile } from "fs/promises";
import { stringifyJSON } from "./utils";
import type { Database } from "better-sqlite3";

export async function extractAndSaveQuery(
    db: Database,
    outputPath: string,
    sql: string,
    ...params: unknown[]
): Promise<void> {
    const rows = db.prepare(sql).all(...params);
    await writeFile(outputPath, stringifyJSON(rows), "utf-8");
    console.log(`${outputPath} successfully written`);
}
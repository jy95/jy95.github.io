import { writeFile } from "fs/promises";
import { stringifyJSON } from "./common/utils";

import type { Database } from "better-sqlite3";

/**
 * Extracts dlcs from the database and saves them to a file.
 */
export async function extractAndSaveDLCS(db: Database, outputPath: string): Promise<void> {
    const extractDLCSStmt = db.prepare("SELECT * FROM dlcs_as_json");
    const dlcs = extractDLCSStmt.all();
    await writeFile(
        outputPath,
        stringifyJSON(dlcs),
        "utf-8"
    );
    console.log(`${outputPath} successfully written`);
}
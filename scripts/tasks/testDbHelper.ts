import { resolve } from 'node:path';
import { copyFileSync, unlinkSync, existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import Database from 'better-sqlite3';
import { getDatabasePath } from '../common/db';
import { applyViews } from "../common/applyViews";

import type { Database as SQLDatabase } from 'better-sqlite3';

const REAL_DB_PATH = getDatabasePath();
export const hasRealDb = existsSync(REAL_DB_PATH);

export async function openTestDb(): Promise<{ db: SQLDatabase; cleanup: () => void; }> {
    if (!hasRealDb) {
        throw new Error(`Expected a database file at ${REAL_DB_PATH} to copy for tests`);
    }

    // Using tmpdir() keeps the file away from Vitest/Vite file watchers
    const tmpPath = resolve(tmpdir(), `yt-gaming-test-db-${randomUUID()}.sqlite`);
    copyFileSync(REAL_DB_PATH, tmpPath);
    const db = new Database(tmpPath);

    // Apply checked-in SQL view definitions asynchronously
    await applyViews(db);

    const cleanup = () => {
        db.close();
        if (existsSync(tmpPath)) {
            try {
                unlinkSync(tmpPath);
            } catch {
                // Prevents crashes if Windows takes a moment to release the handle
            }
        }
    };

    return { db, cleanup };
}
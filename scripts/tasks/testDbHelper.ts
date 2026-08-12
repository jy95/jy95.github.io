import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { copyFileSync, unlinkSync, existsSync } from 'fs';
import { randomUUID } from 'crypto';
import { tmpdir } from 'os';
import Database from 'better-sqlite3';

import type { Database as SQLDatabase } from 'better-sqlite3';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REAL_DB_PATH = resolve(__dirname, '..', '..', 'GamesPassionFR.db');

export const hasRealDb = existsSync(REAL_DB_PATH);

export function openTestDb(): { db: SQLDatabase; cleanup: () => void } {
    if (!hasRealDb) {
        throw new Error(`Expected a database file at ${REAL_DB_PATH} to copy for tests`);
    }

    // Using tmpdir() keeps the file away from Vitest/Vite file watchers
    const tmpPath = resolve(tmpdir(), `yt-gaming-test-db-${randomUUID()}.sqlite`);
    copyFileSync(REAL_DB_PATH, tmpPath);
    const db = new Database(tmpPath);

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
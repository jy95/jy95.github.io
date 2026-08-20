import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

import type { Options } from 'better-sqlite3';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Path to the canonical GamesPassionFR SQLite database, resolved relative
 * to this module (scripts/common/db.ts -> repo root).
 */
export function getDatabasePath(): string {
    return resolve(__dirname, '..', '..', 'GamesPassionFR.db');
}

/**
 * Opens the canonical GamesPassionFR database.
 *
 * Centralizes the `resolve(__dirname, ...) + new Database(...)` pair that
 * used to be duplicated (with slightly different options each time) across
 * generateJsonFiles.ts, automatedTasks.ts, findPublishedGames.ts,
 * hltb_fetcher.ts and generate-playlist-csv.ts.
 *
 * @param options Forwarded verbatim to better-sqlite3 (readonly, verbose, ...).
 */
export function openDatabase(options: Options = { verbose: console.log }): Database.Database {
    return new Database(getDatabasePath(), options);
}
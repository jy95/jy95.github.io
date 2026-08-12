import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFile } from 'fs/promises';
import { openTestDb, hasRealDb } from '../tasks/testDbHelper';
import { tempOutputPath } from './common/testFileHelper';
import { extractAndSaveGenres } from './genres';
import type { Database } from 'better-sqlite3';

describe.skipIf(!hasRealDb)('extractAndSaveGenres', () => {
    let db: Database;
    let cleanupDb: () => void;
    let outPath: string;
    let cleanupFile: () => void;

    beforeEach(() => {
        ({ db, cleanup: cleanupDb } = openTestDb() as any);
        ({ path: outPath, cleanup: cleanupFile } = tempOutputPath('genres'));
    });
    afterEach(() => {
        cleanupDb();
        cleanupFile();
    });

    it('writes exactly the rows in the genres table, in the same order', async () => {
        await extractAndSaveGenres(db, outPath);
        const written = JSON.parse(await readFile(outPath, 'utf-8'));
        const rows = db.prepare('SELECT id, name FROM genres').all();
        expect(written).toEqual(rows);
    });

    it('produces valid, parseable JSON even when the table is queried twice in a row', async () => {
        await extractAndSaveGenres(db, outPath);
        const firstRun = await readFile(outPath, 'utf-8');

        await extractAndSaveGenres(db, outPath);
        const secondRun = await readFile(outPath, 'utf-8');

        expect(JSON.parse(secondRun)).toEqual(JSON.parse(firstRun));
    });
});
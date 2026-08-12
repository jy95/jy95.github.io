import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFile } from 'fs/promises';
import { openTestDb, hasRealDb } from '../tasks/testDbHelper';
import { tempOutputPath } from './common/testFileHelper';
import { extractAndSavePlatforms } from './platforms';
import type { Database } from 'better-sqlite3';

describe.skipIf(!hasRealDb)('extractAndSavePlatforms', () => {
    let db: Database;
    let cleanupDb: () => void;
    let outPath: string;
    let cleanupFile: () => void;

    beforeEach(() => {
        ({ db, cleanup: cleanupDb } = openTestDb() as any);
        ({ path: outPath, cleanup: cleanupFile } = tempOutputPath('platforms'));
    });
    afterEach(() => {
        cleanupDb();
        cleanupFile();
    });

    it('writes a JSON array with one entry per row in the platforms table', async () => {
        const expectedCount = db.prepare('SELECT COUNT(*) AS n FROM platforms').get() as { n: number };

        await extractAndSavePlatforms(db, outPath);
        const written = JSON.parse(await readFile(outPath, 'utf-8'));

        expect(Array.isArray(written)).toBe(true);
        expect(written).toHaveLength(expectedCount.n);
    });

    it('every written entry has a numeric id and non-empty name, matching the table directly', async () => {
        await extractAndSavePlatforms(db, outPath);
        const written = JSON.parse(await readFile(outPath, 'utf-8')) as { id: number; name: string }[];

        const rows = db.prepare('SELECT id, name FROM platforms').all() as { id: number; name: string }[];
        expect(written).toEqual(rows);
    });

    it('includes the well-known platform ids used elsewhere in the app (1-7)', async () => {
        await extractAndSavePlatforms(db, outPath);
        const written = JSON.parse(await readFile(outPath, 'utf-8')) as { id: number }[];
        const ids = written.map((p) => p.id).sort((a, b) => a - b);
        expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });
});
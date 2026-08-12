import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFile } from 'fs/promises';
import { openTestDb, hasRealDb } from '../tasks/testDbHelper';
import { tempOutputPath } from './common/testFileHelper';
import { extractAndSaveSeries } from './series';
import type { Database } from 'better-sqlite3';

describe.skipIf(!hasRealDb)('extractAndSaveSeries', () => {
    let db: Database;
    let cleanupDb: () => void;
    let outPath: string;
    let cleanupFile: () => void;

    beforeEach(() => {
        ({ db, cleanup: cleanupDb } = openTestDb() as any);
        ({ path: outPath, cleanup: cleanupFile } = tempOutputPath('series'));
    });
    afterEach(() => {
        cleanupDb();
        cleanupFile();
    });

    it('matches the row count of the series_as_json view', async () => {
        const expectedCount = db.prepare('SELECT COUNT(*) AS n FROM series_as_json').get() as { n: number };

        await extractAndSaveSeries(db, outPath);
        const written = JSON.parse(await readFile(outPath, 'utf-8'));

        expect(written).toHaveLength(expectedCount.n);
    });

    it('every series entry has a non-empty items array', async () => {
        await extractAndSaveSeries(db, outPath);
        const written = JSON.parse(await readFile(outPath, 'utf-8')) as { items: unknown[] }[];

        for (const serie of written) {
            expect(Array.isArray(serie.items)).toBe(true);
            expect(serie.items.length).toBeGreaterThan(0);
        }
    });

    it('every serie name in the output exists in the series table', async () => {
        await extractAndSaveSeries(db, outPath);
        const written = JSON.parse(await readFile(outPath, 'utf-8')) as { name: string }[];

        const knownNames = new Set(
            (db.prepare('SELECT name FROM series').all() as { name: string }[]).map((r) => r.name)
        );
        for (const serie of written) {
            expect(knownNames.has(serie.name)).toBe(true);
        }
    });
});
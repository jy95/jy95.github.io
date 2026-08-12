import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFile } from 'fs/promises';
import { openTestDb, hasRealDb } from '../tasks/testDbHelper';
import { tempOutputPath } from './common/testFileHelper';
import { extractAndSavePlanning } from './planning';
import type { Database } from 'better-sqlite3';

describe.skipIf(!hasRealDb)('extractAndSavePlanning', () => {
    let db: Database;
    let cleanupDb: () => void;
    let outPath: string;
    let cleanupFile: () => void;

    beforeEach(() => {
        ({ db, cleanup: cleanupDb } = openTestDb() as any);
        ({ path: outPath, cleanup: cleanupFile } = tempOutputPath('planning'));
    });
    afterEach(() => {
        cleanupDb();
        cleanupFile();
    });

    it('matches the row count of games_in_future exactly', async () => {
        const expectedCount = db.prepare('SELECT COUNT(*) AS n FROM games_in_future').get() as { n: number };

        await extractAndSavePlanning(db, outPath);
        const written = JSON.parse(await readFile(outPath, 'utf-8'));

        expect(written).toHaveLength(expectedCount.n);
    });

    it('parses the aggregated genres column into a real JSON array, not a raw string', async () => {
        await extractAndSavePlanning(db, outPath);
        const written = JSON.parse(await readFile(outPath, 'utf-8')) as { genres: unknown }[];

        for (const entry of written) {
            expect(Array.isArray(entry.genres)).toBe(true);
        }
    });

    it('every genre id in the output is a number', async () => {
        await extractAndSavePlanning(db, outPath);
        const written = JSON.parse(await readFile(outPath, 'utf-8')) as { genres: number[] }[];

        for (const entry of written) {
            for (const genreId of entry.genres) {
                expect(typeof genreId).toBe('number');
            }
        }
    });

    it('joins in the parent game row (title, releaseDate, duration) for every future entry', async () => {
        await extractAndSavePlanning(db, outPath);
        const written = JSON.parse(await readFile(outPath, 'utf-8')) as {
            title: string;
            releaseDate: unknown;
            duration: unknown;
        }[];

        for (const entry of written) {
            expect(typeof entry.title).toBe('string');
            expect(entry.title.length).toBeGreaterThan(0);
        }
    });
});
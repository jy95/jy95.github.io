import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFile } from 'fs/promises';
import { openTestDb, hasRealDb } from '../tasks/testDbHelper';
import { tempOutputPath } from './common/testFileHelper';
import { extractAndSaveTierListTests } from './tier-list-tests';
import type { Database } from 'better-sqlite3';

describe.skipIf(!hasRealDb)('extractAndSaveTierListTests', () => {
    let db: Database;
    let cleanupDb: () => void;
    let outPath: string;
    let cleanupFile: () => void;

    beforeEach(() => {
        ({ db, cleanup: cleanupDb } = openTestDb() as any);
        ({ path: outPath, cleanup: cleanupFile } = tempOutputPath('tier-list-tests'));
    });
    afterEach(() => {
        cleanupDb();
        cleanupFile();
    });

    it('the total number of entries across all categories equals the tests row count', async () => {
        const expectedCount = db.prepare('SELECT COUNT(*) AS n FROM tests').get() as { n: number };

        await extractAndSaveTierListTests(db, outPath);
        const written = JSON.parse(await readFile(outPath, 'utf-8')) as Record<string, unknown[]>;
        const total = Object.values(written).reduce((sum, list) => sum + list.length, 0);

        expect(total).toBe(expectedCount.n);
    });

    it('every entry has the card shape expected by /tier/tests (url, url_type, imagePath under /testscovers)', async () => {
        await extractAndSaveTierListTests(db, outPath);
        const written = JSON.parse(await readFile(outPath, 'utf-8')) as Record<
            string,
            { url: string; url_type: string; imagePath: string }[]
        >;

        for (const list of Object.values(written)) {
            for (const entry of list) {
                expect(entry.url).toMatch(/^https:\/\/www\.youtube\.com\//);
                expect(['PLAYLIST', 'VIDEO']).toContain(entry.url_type);
                expect(entry.imagePath.startsWith('/testscovers/')).toBe(true);
            }
        }
    });

    it('places every entry under exactly one category', async () => {
        await extractAndSaveTierListTests(db, outPath);
        const written = JSON.parse(await readFile(outPath, 'utf-8')) as Record<string, { id: string }[]>;

        const seenIds = new Set<string>();
        for (const list of Object.values(written)) {
            for (const entry of list) {
                expect(seenIds.has(entry.id)).toBe(false);
                seenIds.add(entry.id);
            }
        }
    });
});
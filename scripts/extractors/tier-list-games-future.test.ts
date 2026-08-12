import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFile } from 'fs/promises';
import { openTestDb, hasRealDb } from '../tasks/testDbHelper';
import { tempOutputPath } from './common/testFileHelper';
import { extractAndSaveTierListGamesFuture } from './tier-list-games-future';
import type { Database } from 'better-sqlite3';

describe.skipIf(!hasRealDb)('extractAndSaveTierListGamesFuture', () => {
    let db: Database;
    let cleanupDb: () => void;
    let outPath: string;
    let cleanupFile: () => void;

    beforeEach(() => {
        ({ db, cleanup: cleanupDb } = openTestDb() as any);
        ({ path: outPath, cleanup: cleanupFile } = tempOutputPath('tier-list-games-future'));
    });
    afterEach(() => {
        cleanupDb();
        cleanupFile();
    });

    it('the total number of games across all categories equals games_in_future minus dlcs', async () => {
        const expectedCount = db
            .prepare(
                `SELECT COUNT(*) AS n FROM games_in_future gf JOIN games g ON gf.id = g.id WHERE g.id NOT IN (SELECT dlc FROM games_dlcs)`
            )
            .get() as { n: number };

        await extractAndSaveTierListGamesFuture(db, outPath);
        const written = JSON.parse(await readFile(outPath, 'utf-8')) as Record<string, unknown[]>;
        const total = Object.values(written).reduce((sum, list) => sum + list.length, 0);

        expect(total).toBe(expectedCount.n);
    });

    it('creates every tier category key, even when empty', async () => {
        const categorySlugs = (db.prepare('SELECT slug FROM tier_categories').all() as { slug: string }[]).map(
            (c) => c.slug
        );

        await extractAndSaveTierListGamesFuture(db, outPath);
        const written = JSON.parse(await readFile(outPath, 'utf-8')) as Record<string, unknown[]>;

        for (const slug of categorySlugs) {
            expect(written).toHaveProperty(slug);
        }
    });

});
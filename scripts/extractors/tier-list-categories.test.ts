import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFile } from 'fs/promises';
import { openTestDb, hasRealDb } from '../tasks/testDbHelper';
import { tempOutputPath } from './common/testFileHelper';
import { extractAndSaveTierListCategories } from './tier-list-categories';
import type { Database } from 'better-sqlite3';

describe.skipIf(!hasRealDb)('extractAndSaveTierListCategories', () => {
    let db: Database;
    let cleanupDb: () => void;
    let outPath: string;
    let cleanupFile: () => void;

    beforeEach(() => {
        ({ db, cleanup: cleanupDb } = openTestDb() as any);
        ({ path: outPath, cleanup: cleanupFile } = tempOutputPath('tier-list-categories'));
    });
    afterEach(() => {
        cleanupDb();
        cleanupFile();
    });

    it('matches the row count of tier_categories exactly', async () => {
        const expectedCount = db.prepare('SELECT COUNT(*) AS n FROM tier_categories').get() as { n: number };

        await extractAndSaveTierListCategories(db, outPath);
        const written = JSON.parse(await readFile(outPath, 'utf-8'));

        expect(written).toHaveLength(expectedCount.n);
    });

    it('is sorted by display_order ascending, with id as a tiebreaker', async () => {
        const expected = db
            .prepare('SELECT id, slug, display_order FROM tier_categories ORDER BY display_order ASC, id ASC')
            .all();

        await extractAndSaveTierListCategories(db, outPath);
        const written = JSON.parse(await readFile(outPath, 'utf-8'));

        expect(written).toEqual(expected);
    });

    it('includes every well-known tier slug used by the frontend TierCategoryKey type', async () => {
        await extractAndSaveTierListCategories(db, outPath);
        const written = JSON.parse(await readFile(outPath, 'utf-8')) as { slug: string }[];
        const slugs = new Set(written.map((c) => c.slug));

        for (const expectedSlug of [
            'tier_masterpiece',
            'tier_excellent',
            'tier_good',
            'tier_average',
            'tier_poor',
            'tier_bad',
            'tier_not_evaluated',
        ]) {
            expect(slugs.has(expectedSlug)).toBe(true);
        }
    });
});
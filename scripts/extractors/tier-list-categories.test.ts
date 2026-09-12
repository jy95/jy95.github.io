import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import { useExtractorHarness } from '../extractors/common/extractorTestHarness';
import { hasRealDb } from '../tasks/testDbHelper';
import { extractAndSaveTierListCategories } from './tier-list-categories';

describe.skipIf(!hasRealDb)('extractAndSaveTierListCategories', () => {
    
    const ctx = useExtractorHarness('extractAndSaveTierListCategories');

    it('matches the row count of tier_categories exactly', async () => {
        const expectedCount = ctx.db.prepare('SELECT COUNT(*) AS n FROM tier_categories').get() as { n: number };

        await extractAndSaveTierListCategories(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8'));

        expect(written).toHaveLength(expectedCount.n);
    });

    it('is sorted by display_order ascending, with id as a tiebreaker', async () => {
        const expected = ctx.db
            .prepare('SELECT id, slug, display_order FROM tier_categories ORDER BY display_order ASC, id ASC')
            .all();

        await extractAndSaveTierListCategories(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8'));

        expect(written).toEqual(expected);
    });

    it('includes every well-known tier slug used by the frontend TierCategoryKey type', async () => {
        await extractAndSaveTierListCategories(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as { slug: string }[];
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
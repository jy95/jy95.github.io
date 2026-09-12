import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import { useExtractorHarness } from '../extractors/common/extractorTestHarness';
import { hasRealDb } from '../tasks/testDbHelper';
import { extractAndSaveTierListTests } from './tier-list-tests';

describe.skipIf(!hasRealDb)('extractAndSaveTierListTests', () => {

    const ctx = useExtractorHarness('extractAndSaveTierListTests');

    it('the total number of entries across all categories equals the tests row count', async () => {
        const expectedCount = ctx.db.prepare('SELECT COUNT(*) AS n FROM tests').get() as { n: number };

        await extractAndSaveTierListTests(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as Record<string, unknown[]>;
        const total = Object.values(written).reduce((sum, list) => sum + list.length, 0);

        expect(total).toBe(expectedCount.n);
    });

    it('every entry has the card shape expected by /tier/tests (url, url_type, imagePath under /testscovers)', async () => {
        await extractAndSaveTierListTests(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as Record<
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
        await extractAndSaveTierListTests(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as Record<string, { id: string }[]>;

        const seenIds = new Set<string>();
        for (const list of Object.values(written)) {
            for (const entry of list) {
                expect(seenIds.has(entry.id)).toBe(false);
                seenIds.add(entry.id);
            }
        }
    });
});
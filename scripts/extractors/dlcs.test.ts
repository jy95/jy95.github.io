import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import { useExtractorHarness } from '../extractors/common/extractorTestHarness';
import { hasRealDb } from '../tasks/testDbHelper';
import { extractAndSaveDLCS } from './dlcs';

describe.skipIf(!hasRealDb)('extractAndSaveDLCS', () => {
    const ctx = useExtractorHarness('extractAndSaveDLCS');

    it('matches the row count of the dlcs_as_json view', async () => {
        const expectedCount = ctx.db.prepare('SELECT COUNT(*) AS n FROM dlcs_as_json').get() as { n: number };

        await extractAndSaveDLCS(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8'));

        expect(written).toHaveLength(expectedCount.n);
    });

    it('matches the number of distinct games that own at least one DLC', async () => {
        const expectedCount = ctx.db
            .prepare('SELECT COUNT(DISTINCT game) AS n FROM games_dlcs')
            .get() as { n: number };

        await extractAndSaveDLCS(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8'));

        expect(written).toHaveLength(expectedCount.n);
    });

    it('every parent entry lists at least one dlc item', async () => {
        await extractAndSaveDLCS(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as { dlcs: unknown[] }[];

        for (const entry of written) {
            expect(Array.isArray(entry.dlcs)).toBe(true);
            expect(entry.dlcs.length).toBeGreaterThan(0);
        }
    });
});
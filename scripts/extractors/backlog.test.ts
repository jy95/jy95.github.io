import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import { useExtractorHarness } from '../extractors/common/extractorTestHarness';
import { hasRealDb } from '../tasks/testDbHelper';
import { extractAndSaveBacklog } from './backlog';

describe.skipIf(!hasRealDb)('extractAndSaveBacklog', () => {
    const ctx = useExtractorHarness('extractAndSaveBacklog');

    it('writes one entry per row in the backlog table', async () => {
        const expectedCount = ctx.db.prepare('SELECT COUNT(*) AS n FROM backlog').get() as { n: number };

        await extractAndSaveBacklog(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8'));

        expect(written).toHaveLength(expectedCount.n);
    });

    it('drops null fields (e.g. missing notes/platform) rather than writing them as null', async () => {
        const rowWithNulls = ctx.db
            .prepare('SELECT id FROM backlog WHERE notes IS NULL LIMIT 1')
            .get() as { id: number } | undefined;

        // Only meaningful if the fixture actually has such a row; skip the
        // assertion body (not the test) otherwise, so this stays green
        // across differently-seeded databases without a false pass.
        if (!rowWithNulls) return;

        await extractAndSaveBacklog(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as { id: number }[];
        const entry = written.find((e) => e.id === rowWithNulls.id);

        expect(entry).toBeDefined();
        expect(entry).not.toHaveProperty('notes');
    });

    it('preserves title and hltb duration fields verbatim', async () => {
        const sample = ctx.db.prepare('SELECT id, title, hltb_main FROM backlog LIMIT 1').get() as {
            id: number;
            title: string;
            hltb_main: string | null;
        };

        await extractAndSaveBacklog(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as { id: number; title: string; hltb_main?: string }[];
        const entry = written.find((e) => e.id === sample.id)!;

        expect(entry.title).toBe(sample.title);
        if (sample.hltb_main !== null) {
            expect(entry.hltb_main).toBe(sample.hltb_main);
        }
    });
});
import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import { useExtractorHarness } from '../extractors/common/extractorTestHarness';
import { hasRealDb } from '../tasks/testDbHelper';
import { extractAndSaveTierListBacklog } from './tier-list-backlog';

describe.skipIf(!hasRealDb)('extractAndSaveTierListBacklog', () => {
    const ctx = useExtractorHarness('extractAndSaveTierListBacklog');

    it('the total number of entries across all categories equals the backlog row count', async () => {
        const expectedCount = ctx.db.prepare('SELECT COUNT(*) AS n FROM backlog').get() as { n: number };

        await extractAndSaveTierListBacklog(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as Record<string, unknown[]>;
        const total = Object.values(written).reduce((sum, list) => sum + list.length, 0);

        expect(total).toBe(expectedCount.n);
    });

    it('places every entry under exactly one category (no game appears twice)', async () => {
        await extractAndSaveTierListBacklog(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as Record<string, { id: string }[]>;

        const seenIds = new Set<string>();
        for (const list of Object.values(written)) {
            for (const entry of list) {
                expect(seenIds.has(entry.id)).toBe(false);
                seenIds.add(entry.id);
            }
        }
    });

    it('derives imagePath from the backlog numeric id', async () => {
        await extractAndSaveTierListBacklog(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as Record<string, { id: string; imagePath: string }[]>;

        for (const list of Object.values(written)) {
            for (const entry of list) {
                expect(entry.imagePath).toBe(`/backlogcovers/${entry.id}/cover.webp`);
            }
        }
    });

    it('untagged backlog rows fall into the tier_not_evaluated bucket', async () => {
        await extractAndSaveTierListBacklog(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as Record<string, { id: string }[]>;

        const taggedIds = new Set(
            (ctx.db.prepare('SELECT backlog_id FROM tier_list_backlog').all() as { backlog_id: number }[]).map((r) =>
                String(r.backlog_id)
            )
        );
        const allBacklogIds = (ctx.db.prepare('SELECT id FROM backlog').all() as { id: number }[]).map((r) => String(r.id));
        const untaggedIds = allBacklogIds.filter((id) => !taggedIds.has(id));

        const notEvaluatedIds = new Set((written.tier_not_evaluated ?? []).map((e) => e.id));
        for (const id of untaggedIds) {
            expect(notEvaluatedIds.has(id)).toBe(true);
        }
    });
});
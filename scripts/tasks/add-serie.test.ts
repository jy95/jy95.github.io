import { describe, it, expect } from 'vitest';
import { useExtractorHarness } from '../extractors/common/extractorTestHarness';
import { randomUUID } from 'node:crypto';
import { hasRealDb } from './testDbHelper';
import { addSerieToDatabase } from './add-serie';

describe.skipIf(!hasRealDb)('addSerieToDatabase', () => {
    const ctx = useExtractorHarness('addSerieToDatabase');

    it('inserts a row readable back by title', async () => {
        const title = `Vitest Serie ${randomUUID()}`;
        await addSerieToDatabase(ctx.db, { title });

        const row = ctx.db.prepare('SELECT * FROM series WHERE name = ?').get(title) as any;
        expect(row).toBeDefined();
        expect(row.name).toBe(title);
    });

    it('increases the row count by exactly one per insert', async () => {
        const before = ctx.db.prepare('SELECT COUNT(*) AS n FROM series').get() as { n: number };
        await addSerieToDatabase(ctx.db, { title: `Vitest Count Serie ${randomUUID()}` });
        const after = ctx.db.prepare('SELECT COUNT(*) AS n FROM series').get() as { n: number };
        expect(after.n).toBe(before.n + 1);
    });
});
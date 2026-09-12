import { describe, it, expect } from 'vitest';
import { useExtractorHarness } from '../extractors/common/extractorTestHarness';
import { hasRealDb } from './testDbHelper';
import { addBacklogToDatabase } from './add-backlog';

describe.skipIf(!hasRealDb)('addBacklogToDatabase', () => {
    const ctx = useExtractorHarness('addBacklogToDatabase');

    it('inserts a row readable back by title', async () => {
        await addBacklogToDatabase(ctx.db, { title: 'Vitest Fixture Game' });

        const row = ctx.db.prepare('SELECT * FROM backlog WHERE title = ?').get('Vitest Fixture Game') as any;
        expect(row).toBeDefined();
        expect(row.title).toBe('Vitest Fixture Game');
        expect(row.platform).toBeNull();
        expect(row.notes).toBeNull();
    });

    it('stores a known platform name as its numeric id', async () => {
        await addBacklogToDatabase(ctx.db, { title: 'Vitest PC Fixture', platform: 'PC' });
        const row = ctx.db.prepare('SELECT platform FROM backlog WHERE title = ?').get('Vitest PC Fixture') as any;
        expect(row.platform).toBe(1);
    });

    it('increases the row count by exactly one per insert', async () => {
        const before = ctx.db.prepare('SELECT COUNT(*) AS n FROM backlog').get() as { n: number };
        await addBacklogToDatabase(ctx.db, { title: 'Vitest Count Fixture' });
        const after = ctx.db.prepare('SELECT COUNT(*) AS n FROM backlog').get() as { n: number };
        expect(after.n).toBe(before.n + 1);
    });

});
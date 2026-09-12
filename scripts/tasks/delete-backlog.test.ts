import { describe, it, expect } from 'vitest';
import { useExtractorHarness } from '../extractors/common/extractorTestHarness';
import { hasRealDb } from './testDbHelper';
import { addBacklogToDatabase } from './add-backlog';
import { deleteBacklogFromDatabase } from './delete-backlog';

describe.skipIf(!hasRealDb)('deleteBacklogFromDatabase', () => {

    const ctx = useExtractorHarness('deleteBacklogFromDatabase');

    it('removes a row that was just inserted', async () => {
        await addBacklogToDatabase(ctx.db, { title: 'Vitest Delete Fixture' });
        expect(ctx.db.prepare('SELECT * FROM backlog WHERE title = ?').get('Vitest Delete Fixture')).toBeDefined();

        await deleteBacklogFromDatabase(ctx.db, { title: 'Vitest Delete Fixture' });
        expect(ctx.db.prepare('SELECT * FROM backlog WHERE title = ?').get('Vitest Delete Fixture')).toBeUndefined();
    });

    it('reports zero changes for a title that does not exist', async () => {
        const result = await deleteBacklogFromDatabase(ctx.db, { title: 'Definitely Not A Real Title 12345' });
        expect(result.changes).toBe(0);
    });

    it('does not affect the total row count when the title does not exist', async () => {
        const before = ctx.db.prepare('SELECT COUNT(*) AS n FROM backlog').get() as { n: number };
        await deleteBacklogFromDatabase(ctx.db, { title: 'Definitely Not A Real Title 12345' });
        const after = ctx.db.prepare('SELECT COUNT(*) AS n FROM backlog').get() as { n: number };
        expect(after.n).toBe(before.n);
    });
});
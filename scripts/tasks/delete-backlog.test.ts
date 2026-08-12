import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { openTestDb, hasRealDb } from './testDbHelper';
import { addBacklogToDatabase } from './add-backlog';
import { deleteBacklogFromDatabase } from './delete-backlog';
import type { Database } from 'better-sqlite3';

describe.skipIf(!hasRealDb)('deleteBacklogFromDatabase', () => {
    let db: Database;
    let cleanup: () => void;

    beforeEach(() => { ({ db, cleanup } = openTestDb()); });
    afterEach(() => { cleanup(); });

    it('removes a row that was just inserted', async () => {
        await addBacklogToDatabase(db, { title: 'Vitest Delete Fixture' });
        expect(db.prepare('SELECT * FROM backlog WHERE title = ?').get('Vitest Delete Fixture')).toBeDefined();

        await deleteBacklogFromDatabase(db, { title: 'Vitest Delete Fixture' });
        expect(db.prepare('SELECT * FROM backlog WHERE title = ?').get('Vitest Delete Fixture')).toBeUndefined();
    });

    it('reports zero changes for a title that does not exist', async () => {
        const result = await deleteBacklogFromDatabase(db, { title: 'Definitely Not A Real Title 12345' });
        expect(result.changes).toBe(0);
    });

    it('does not affect the total row count when the title does not exist', async () => {
        const before = db.prepare('SELECT COUNT(*) AS n FROM backlog').get() as { n: number };
        await deleteBacklogFromDatabase(db, { title: 'Definitely Not A Real Title 12345' });
        const after = db.prepare('SELECT COUNT(*) AS n FROM backlog').get() as { n: number };
        expect(after.n).toBe(before.n);
    });
});
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { openTestDb, hasRealDb } from './testDbHelper';
import { addBacklogToDatabase } from './add-backlog';
import type { Database } from 'better-sqlite3';

describe.skipIf(!hasRealDb)('addBacklogToDatabase', () => {
    let db: Database;
    let cleanup: () => void;

    beforeEach(() => { ({ db, cleanup } = openTestDb()); });
    afterEach(() => { cleanup(); });

    it('inserts a row readable back by title', async () => {
        await addBacklogToDatabase(db, { title: 'Vitest Fixture Game' });

        const row = db.prepare('SELECT * FROM backlog WHERE title = ?').get('Vitest Fixture Game') as any;
        expect(row).toBeDefined();
        expect(row.title).toBe('Vitest Fixture Game');
        expect(row.platform).toBeNull();
        expect(row.notes).toBeNull();
    });

    it('stores a known platform name as its numeric id', async () => {
        await addBacklogToDatabase(db, { title: 'Vitest PC Fixture', platform: 'PC' });
        const row = db.prepare('SELECT platform FROM backlog WHERE title = ?').get('Vitest PC Fixture') as any;
        expect(row.platform).toBe(1);
    });

    it('increases the row count by exactly one per insert', async () => {
        const before = db.prepare('SELECT COUNT(*) AS n FROM backlog').get() as { n: number };
        await addBacklogToDatabase(db, { title: 'Vitest Count Fixture' });
        const after = db.prepare('SELECT COUNT(*) AS n FROM backlog').get() as { n: number };
        expect(after.n).toBe(before.n + 1);
    });

    it('never leaks into a separate fresh copy of the db', async () => {
        await addBacklogToDatabase(db, { title: 'Should Not Leak Fixture' });

        const other = openTestDb();
        try {
            const leaked = other.db.prepare('SELECT * FROM backlog WHERE title = ?').get('Should Not Leak Fixture');
            expect(leaked).toBeUndefined();
        } finally {
            other.cleanup();
        }
    });
});
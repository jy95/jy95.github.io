import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { randomUUID } from 'crypto';
import { openTestDb, hasRealDb } from './testDbHelper';
import { addSerieToDatabase } from './add-serie';
import type { Database } from 'better-sqlite3';

describe.skipIf(!hasRealDb)('addSerieToDatabase', () => {
    let db: Database;
    let cleanup: () => void;

    beforeEach(() => { ({ db, cleanup } = openTestDb()); });
    afterEach(() => { cleanup(); });

    it('inserts a row readable back by title', async () => {
        const title = `Vitest Serie ${randomUUID()}`;
        await addSerieToDatabase(db, { title });

        const row = db.prepare('SELECT * FROM series WHERE name = ?').get(title) as any;
        expect(row).toBeDefined();
        expect(row.name).toBe(title);
    });

    it('increases the row count by exactly one per insert', async () => {
        const before = db.prepare('SELECT COUNT(*) AS n FROM series').get() as { n: number };
        await addSerieToDatabase(db, { title: `Vitest Count Serie ${randomUUID()}` });
        const after = db.prepare('SELECT COUNT(*) AS n FROM series').get() as { n: number };
        expect(after.n).toBe(before.n + 1);
    });

    it('never leaks into a separate fresh copy of the db', async () => {
        const title = `Should Not Leak Serie ${randomUUID()}`;
        await addSerieToDatabase(db, { title });

        const other = openTestDb();
        try {
            const leaked = other.db.prepare('SELECT * FROM series WHERE name = ?').get(title);
            expect(leaked).toBeUndefined();
        } finally {
            other.cleanup();
        }
    });
});
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { randomUUID } from 'crypto';
import { openTestDb, hasRealDb } from './testDbHelper';
import { addTestToDatabase } from './add-test';
import { deleteTestFromDatabase } from './delete-test';
import type { Database } from 'better-sqlite3';

describe.skipIf(!hasRealDb)('deleteTestFromDatabase', () => {
    let db: Database;
    let cleanup: () => void;

    beforeEach(() => { ({ db, cleanup } = openTestDb()); });
    afterEach(() => { cleanup(); });

    it('removes a row that was just inserted', async () => {
        const identifier = `vitest-delete-${randomUUID()}`;
        await addTestToDatabase(db, {
            title: 'Vitest Delete Fixture',
            identifierKind: 'Video',
            identifierValue: identifier,
            platform: 'PC',
        });
        expect(db.prepare('SELECT * FROM tests WHERE videoId = ?').get(identifier)).toBeDefined();

        await deleteTestFromDatabase(db, { identifierKind: 'Video', identifierValue: identifier });
        expect(db.prepare('SELECT * FROM tests WHERE videoId = ?').get(identifier)).toBeUndefined();
    });

    it('removes a playlist-identified row using the playlistId field', async () => {
        const identifier = `PLvitest-delete-${randomUUID()}`;
        await addTestToDatabase(db, {
            title: 'Vitest Delete Playlist Fixture',
            identifierKind: 'Playlist',
            identifierValue: identifier,
            platform: 'PC',
        });

        await deleteTestFromDatabase(db, { identifierKind: 'Playlist', identifierValue: identifier });
        expect(db.prepare('SELECT * FROM tests WHERE playlistId = ?').get(identifier)).toBeUndefined();
    });

    it('does not affect the total row count when the identifier does not exist', async () => {
        const before = db.prepare('SELECT COUNT(*) AS n FROM tests').get() as { n: number };
        await deleteTestFromDatabase(db, { identifierKind: 'Video', identifierValue: 'DOES_NOT_EXIST_XYZ' });
        const after = db.prepare('SELECT COUNT(*) AS n FROM tests').get() as { n: number };
        expect(after.n).toBe(before.n);
    });
});
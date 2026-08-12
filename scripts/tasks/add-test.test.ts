import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { randomUUID } from 'crypto';
import { openTestDb, hasRealDb } from './testDbHelper';
import { addTestToDatabase } from './add-test';
import type { Database } from 'better-sqlite3';

describe.skipIf(!hasRealDb)('addTestToDatabase', () => {
    let db: Database;
    let cleanup: () => void;

    beforeEach(() => { ({ db, cleanup } = openTestDb()); });
    afterEach(() => { cleanup(); });

    it('inserts a row readable back by videoId when identifierKind is Video', async () => {
        const identifier = `vitest-${randomUUID()}`;
        await addTestToDatabase(db, {
            title: 'Vitest Test Fixture',
            identifierKind: 'Video',
            identifierValue: identifier,
            platform: 'PC',
        });

        const row = db.prepare('SELECT * FROM tests WHERE videoId = ?').get(identifier) as any;
        expect(row).toBeDefined();
        expect(row.title).toBe('Vitest Test Fixture');
        expect(row.platform).toBe(1);
    });

    it('inserts a row readable back by playlistId when identifierKind is Playlist', async () => {
        const identifier = `PLvitest-${randomUUID()}`;
        await addTestToDatabase(db, {
            title: 'Vitest Playlist Test Fixture',
            identifierKind: 'Playlist',
            identifierValue: identifier,
            platform: 'PS3',
        });

        const row = db.prepare('SELECT * FROM tests WHERE playlistId = ?').get(identifier) as any;
        expect(row).toBeDefined();
        expect(row.platform).toBe(6);
    });

    it('defaults duration to 00:00:00 when omitted', async () => {
        const identifier = `vitest-duration-${randomUUID()}`;
        await addTestToDatabase(db, {
            title: 'Vitest Duration Default',
            identifierKind: 'Video',
            identifierValue: identifier,
            platform: 'PC',
        });

        const row = db.prepare('SELECT duration FROM tests WHERE videoId = ?').get(identifier) as any;
        expect(row.duration).toBe('00:00:00');
    });

    it('defaults releaseDate to today (YYYY-MM-DD) when omitted', async () => {
        const identifier = `vitest-date-${randomUUID()}`;
        const dateBeforeInsert = new Date().toISOString().slice(0, 10);
        await addTestToDatabase(db, {
            title: 'Vitest Release Date Default',
            identifierKind: 'Video',
            identifierValue: identifier,
            platform: 'PC',
        });

        const row = db.prepare('SELECT releaseDate FROM tests WHERE videoId = ?').get(identifier) as any;
        const dateAfterInsert = new Date().toISOString().slice(0, 10);
        expect([dateBeforeInsert, dateAfterInsert]).toContain(row.releaseDate)
    });

    it('stores an explicit duration and releaseDate when provided', async () => {
        const identifier = `vitest-explicit-${randomUUID()}`;
        await addTestToDatabase(db, {
            title: 'Vitest Explicit Fixture',
            identifierKind: 'Video',
            identifierValue: identifier,
            platform: 'PC',
            duration: '01:23:45',
            releaseDate: '2020-05-06',
        });

        const row = db.prepare('SELECT duration, releaseDate FROM tests WHERE videoId = ?').get(identifier) as any;
        expect(row.duration).toBe('01:23:45');
        expect(row.releaseDate).toBe('2020-05-06');
    });
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { randomUUID } from 'crypto';
import { openTestDb, hasRealDb } from './testDbHelper';
import { addTestToDatabase } from './add-test';
import { updateTestInDatabase } from './update-test';
import type { Database } from 'better-sqlite3';

describe.skipIf(!hasRealDb)('updateTestInDatabase', () => {
    let db: Database;
    let cleanup: () => void;
    let identifier: string;

    beforeEach(async () => {
        ({ db, cleanup } = openTestDb());
        identifier = `vitest-update-${randomUUID()}`;
        await addTestToDatabase(db, {
            title: 'Original Title',
            identifierKind: 'Video',
            identifierValue: identifier,
            platform: 'PC',
            duration: '01:00:00',
            releaseDate: '2020-01-01',
        });
    });
    afterEach(() => { cleanup(); });

    it('throws for an identifier matching no test', async () => {
        await expect(
            updateTestInDatabase(db, { identifierKind: 'Video', identifierValue: 'DOES_NOT_EXIST_XYZ', title: 'X' })
        ).rejects.toThrow('Test record not found');
    });

    it('updates the title when provided', async () => {
        await updateTestInDatabase(db, { identifierKind: 'Video', identifierValue: identifier, title: 'Updated Title' });
        const row = db.prepare('SELECT title FROM tests WHERE videoId = ?').get(identifier) as any;
        expect(row.title).toBe('Updated Title');
    });

    it('leaves the title untouched when it is omitted', async () => {
        await updateTestInDatabase(db, { identifierKind: 'Video', identifierValue: identifier, duration: '02:00:00' });
        const row = db.prepare('SELECT title FROM tests WHERE videoId = ?').get(identifier) as any;
        expect(row.title).toBe('Original Title');
    });

    it('leaves the title untouched when it is an empty string', async () => {
        await updateTestInDatabase(db, { identifierKind: 'Video', identifierValue: identifier, title: '' });
        const row = db.prepare('SELECT title FROM tests WHERE videoId = ?').get(identifier) as any;
        expect(row.title).toBe('Original Title');
    });

    it('updates the platform when provided', async () => {
        await updateTestInDatabase(db, { identifierKind: 'Video', identifierValue: identifier, platform: 'PS3' });
        const row = db.prepare('SELECT platform FROM tests WHERE videoId = ?').get(identifier) as any;
        expect(row.platform).toBe(6);
    });

    it('updates duration and releaseDate together', async () => {
        await updateTestInDatabase(db, {
            identifierKind: 'Video',
            identifierValue: identifier,
            duration: '03:30:00',
            releaseDate: '2022-12-25',
        });
        const row = db.prepare('SELECT duration, releaseDate FROM tests WHERE videoId = ?').get(identifier) as any;
        expect(row.duration).toBe('03:30:00');
        expect(row.releaseDate).toBe('2022-12-25');
    });
});
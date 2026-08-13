import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { randomUUID } from 'crypto';
import { openTestDb, hasRealDb } from './testDbHelper';
import type { Database } from 'better-sqlite3';

// delete-game.ts calls `rm` from 'fs/promises' against the real public/covers
// folder. Mock it so the test suite never deletes real files on disk.
const { rmMock } = vi.hoisted(() => ({ rmMock: vi.fn() }));

vi.mock('fs/promises', async (importOriginal) => {
    const actual = await importOriginal<typeof import('fs/promises')>();
    return { ...actual, rm: rmMock };
});

const { addGameToDatabase } = await import('./add-game');
const { deleteGameFromDatabase } = await import('./delete-game');

describe.skipIf(!hasRealDb)('deleteGameFromDatabase', () => {
    let db: Database;
    let cleanup: () => void;

    beforeEach(() => {
        ({ db, cleanup } = openTestDb());
        rmMock.mockReset();
        rmMock.mockResolvedValue(undefined);
    });
    afterEach(() => {
        cleanup();
    });

    it('removes the row and the cover folder for a video identifier', async () => {
        const identifier = `vitest-delete-game-${randomUUID()}`;
        await addGameToDatabase(db, {
            title: 'Vitest Delete Game Fixture',
            releaseDate: '2020-01-01',
            identifierKind: 'Video',
            identifierValue: identifier,
            platform: 'PC',
        });

        await deleteGameFromDatabase(db, { identifierKind: 'Video', identifierValue: identifier });

        expect(db.prepare('SELECT * FROM games WHERE videoId = ?').get(identifier)).toBeUndefined();
        expect(rmMock).toHaveBeenCalledTimes(1);
        expect(String(rmMock.mock.calls[0][0])).toContain(identifier);
        expect(rmMock.mock.calls[0][1]).toMatchObject({ recursive: true, force: true });
    });

    it('removes a row keyed by playlistId when identifierKind is Playlist', async () => {
        const identifier = `PLvitest-delete-game-${randomUUID()}`;
        await addGameToDatabase(db, {
            title: 'Vitest Delete Playlist Game Fixture',
            releaseDate: '2020-01-01',
            identifierKind: 'Playlist',
            identifierValue: identifier,
            platform: 'PS3',
        });

        await deleteGameFromDatabase(db, { identifierKind: 'Playlist', identifierValue: identifier });

        expect(db.prepare('SELECT * FROM games WHERE playlistId = ?').get(identifier)).toBeUndefined();
    });

    it('throws for an identifier matching no game and never touches the filesystem', async () => {
        await expect(
            deleteGameFromDatabase(db, { identifierKind: 'Video', identifierValue: 'DOES_NOT_EXIST_XYZ' })
        ).rejects.toThrow(/Game not found/);

        expect(rmMock).not.toHaveBeenCalled();
    });

    it('does not affect the total row count when the identifier does not exist', async () => {
        const before = db.prepare('SELECT COUNT(*) AS n FROM games').get() as { n: number };

        await expect(
            deleteGameFromDatabase(db, { identifierKind: 'Video', identifierValue: 'DOES_NOT_EXIST_XYZ' })
        ).rejects.toThrow();

        const after = db.prepare('SELECT COUNT(*) AS n FROM games').get() as { n: number };
        expect(after.n).toBe(before.n);
    });

    it('decreases the total row count by exactly one on a successful delete', async () => {
        const identifier = `vitest-delete-count-${randomUUID()}`;
        await addGameToDatabase(db, {
            title: 'Vitest Delete Count Fixture',
            releaseDate: '2020-01-01',
            identifierKind: 'Video',
            identifierValue: identifier,
            platform: 'PC',
        });
        const before = db.prepare('SELECT COUNT(*) AS n FROM games').get() as { n: number };

        await deleteGameFromDatabase(db, { identifierKind: 'Video', identifierValue: identifier });

        const after = db.prepare('SELECT COUNT(*) AS n FROM games').get() as { n: number };
        expect(after.n).toBe(before.n - 1);
    });
});

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { openTestDb, hasRealDb } from './testDbHelper';
import type { Database } from 'better-sqlite3';

const { readdirMock, rmMock } = vi.hoisted(() => ({
    readdirMock: vi.fn(),
    rmMock: vi.fn(),
}));

vi.mock('fs/promises', async (importOriginal) => {
    const actual = await importOriginal<typeof import('fs/promises')>();
    const mock = {
        ...actual,
        readdir: readdirMock,
        rm: rmMock,
    };
    return {
        ...mock,
        default: mock,
    };
});

const { cleanBacklog } = await import('./clean-backlog');

describe.skipIf(!hasRealDb)('cleanBacklog', () => {
    let db: Database;
    let cleanup: () => void;

    beforeEach(() => {
        ({ db, cleanup } = openTestDb());
        readdirMock.mockReset();
        rmMock.mockReset();
        rmMock.mockResolvedValue(undefined);
    });

    afterEach(() => {
        cleanup();
    });

    it('deletes backlog entries whose title matches a game title', async () => {
        const gameTitle = db.prepare('SELECT title FROM games LIMIT 1').pluck().get() as string;
        db.prepare('INSERT INTO backlog (title) VALUES (?)').run(gameTitle);
        readdirMock.mockResolvedValue([]);

        await cleanBacklog(db);

        const row = db.prepare('SELECT * FROM backlog WHERE title = ?').get(gameTitle);
        expect(row).toBeUndefined();
    });

    it('does not delete backlog entries with no matching game title', async () => {
        const uniqueTitle = `Definitely Unique Backlog Title ${Date.now()}`;
        db.prepare('INSERT INTO backlog (title) VALUES (?)').run(uniqueTitle);
        readdirMock.mockResolvedValue([]);

        await cleanBacklog(db);

        const row = db.prepare('SELECT * FROM backlog WHERE title = ?').get(uniqueTitle);
        expect(row).toBeDefined();
    });

    it('handles a missing/unreadable covers directory gracefully', async () => {
        readdirMock.mockRejectedValue(new Error('ENOENT'));

        await expect(cleanBacklog(db)).resolves.not.toThrow();
        expect(rmMock).not.toHaveBeenCalled();
    });

    it('deletes image folders that have no corresponding backlog id', async () => {
        readdirMock.mockResolvedValue([
            { name: '999999', isDirectory: () => true },
            { name: 'not-a-dir.txt', isDirectory: () => false },
        ]);

        await cleanBacklog(db);

        expect(rmMock).toHaveBeenCalledTimes(1);
        expect(String(rmMock.mock.calls[0][0])).toContain('999999');
    });

    it('does not delete image folders that have a corresponding backlog id', async () => {
        const uniqueTitle = `Backlog For Folder Keep ${Date.now()}`;
        db.prepare('INSERT INTO backlog (title) VALUES (?)').run(uniqueTitle);
        const id = db.prepare('SELECT id FROM backlog WHERE title = ?').pluck().get(uniqueTitle) as number;

        readdirMock.mockResolvedValue([{ name: String(id), isDirectory: () => true }]);

        await cleanBacklog(db);

        expect(rmMock).not.toHaveBeenCalled();
    });

    it('does not throw when an individual folder deletion fails', async () => {
        readdirMock.mockResolvedValue([{ name: '888888', isDirectory: () => true }]);
        rmMock.mockRejectedValueOnce(new Error('permission denied'));

        await expect(cleanBacklog(db)).resolves.not.toThrow();
    });

    it('ignores non-directory entries when scanning for orphaned folders', async () => {
        readdirMock.mockResolvedValue([{ name: 'readme.txt', isDirectory: () => false }]);

        await cleanBacklog(db);

        expect(rmMock).not.toHaveBeenCalled();
    });
});
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { readFileSyncMock } = vi.hoisted(() => ({ readFileSyncMock: vi.fn() }));
vi.mock('node:fs', () => ({ default: { readFileSync: readFileSyncMock } }));

const { syncCoversBySearchMock } = vi.hoisted(() => ({ syncCoversBySearchMock: vi.fn().mockResolvedValue(undefined) }));
vi.mock('./common/coverSearchRunner', () => ({ syncCoversBySearch: syncCoversBySearchMock }));

const { run } = await import('./backlog-cover-downloader');

/**
 * Unit test suite for `backlog-cover-downloader`.
 * Tests reading and parsing `backlog.json`, building search items with titles and platform names,
 * handling missing platforms cleanly, error throwing on invalid files, and delegating execution to `syncCoversBySearch`.
 */
describe('backlog-cover-downloader', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => vi.restoreAllMocks());

    /**
     * Verifies that the downloader attempts to read `backlog.json` as UTF-8 text from disk.
     */
    it('reads backlog.json', async () => {
        readFileSyncMock.mockReturnValue('[]');
        await run();
        expect(readFileSyncMock).toHaveBeenCalledWith(expect.stringContaining('backlog.json'), 'utf-8');
    });

    /**
     * Verifies that an error is rethrown and search execution is aborted when `backlog.json` cannot be read.
     */
    it('throws when backlog.json cannot be read', async () => {
        readFileSyncMock.mockImplementation(() => { throw new Error('ENOENT'); });
        await expect(run()).rejects.toThrow('ENOENT');
        expect(syncCoversBySearchMock).not.toHaveBeenCalled();
    });

    /**
     * Verifies that an error is thrown when `backlog.json` contains malformed or unparseable JSON.
     */
    it('throws when backlog.json contains invalid JSON', async () => {
        readFileSyncMock.mockReturnValue('{ not json');
        await expect(run()).rejects.toThrow();
    });

    /**
     * Verifies that each entry in `backlog.json` is mapped to a search item, appending platform names when known.
     */
    it('builds one search item per game, with title + platform name in the query', async () => {
        readFileSyncMock.mockReturnValue(JSON.stringify([
            { id: 1, title: 'Mario Kart', platform: 2 },
            { id: 2, title: 'Unknown Platform Game', platform: 999 },
        ]));

        await run();

        expect(syncCoversBySearchMock).toHaveBeenCalledWith(
            [
                { id: 1, label: 'Mario Kart', searchQuery: 'Mario Kart GBA official box art' },
                { id: 2, label: 'Unknown Platform Game', searchQuery: 'Unknown Platform Game official box art' },
            ],
            expect.objectContaining({ outputRoot: expect.stringContaining('backlogcovers') })
        );
    });

    /**
     * Verifies that when a platform ID is unknown or omitted, the query string is trimmed cleanly without double spaces.
     */
    it('trims a missing platform name cleanly (no double space)', async () => {
        readFileSyncMock.mockReturnValue(JSON.stringify([{ id: 3, title: 'No Platform', platform: 999 }]));
        await run();

        const [items] = syncCoversBySearchMock.mock.calls[0];
        expect(items[0].searchQuery).toBe('No Platform official box art');
    });

    /**
     * Verifies that an empty item array is forwarded to `syncCoversBySearch` when `backlog.json` contains an empty list.
     */
    it('passes an empty item list through when backlog.json is an empty array', async () => {
        readFileSyncMock.mockReturnValue('[]');
        await run();
        expect(syncCoversBySearchMock).toHaveBeenCalledWith([], expect.any(Object));
    });
});
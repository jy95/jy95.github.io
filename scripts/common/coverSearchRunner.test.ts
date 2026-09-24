import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { existsSyncMock, mkdirSyncMock, readdirSyncMock, renameSyncMock, unlinkSyncMock } = vi.hoisted(() => ({
    existsSyncMock: vi.fn(),
    mkdirSyncMock: vi.fn(),
    readdirSyncMock: vi.fn(),
    renameSyncMock: vi.fn(),
    unlinkSyncMock: vi.fn(),
}));

vi.mock('node:fs', () => ({
    default: {
        existsSync: existsSyncMock,
        mkdirSync: mkdirSyncMock,
        readdirSync: readdirSyncMock,
        renameSync: renameSyncMock,
        unlinkSync: unlinkSyncMock,
    },
}));

const { imageSearchMock, closeBrowserMock } = vi.hoisted(() => ({
    imageSearchMock: vi.fn(),
    closeBrowserMock: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('imgsearch-api', () => ({ imageSearch: imageSearchMock, closeBrowser: closeBrowserMock }));

const { downloadImageBufferMock } = vi.hoisted(() => ({ downloadImageBufferMock: vi.fn() }));
vi.mock('./imageDownload', () => ({ downloadImageBuffer: downloadImageBufferMock }));

const { convertBufferToWebpMock } = vi.hoisted(() => ({ convertBufferToWebpMock: vi.fn() }));
vi.mock('./imageConvert', () => ({ convertBufferToWebp: convertBufferToWebpMock }));

const { syncCoversBySearch } = await import('./coverSearchRunner');

const baseOptions = { outputRoot: '/pub/backlogcovers', delayRangeMs: [0, 0] as [number, number] };

/**
 * Unit test suite for `syncCoversBySearch`.
 * Tests image search queries, skipping existing files, image processing,
 * error handling, temporary file cleanup, delay ranges, and browser cleanup.
 */
describe('syncCoversBySearch', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        existsSyncMock.mockReturnValue(false);
        readdirSyncMock.mockReturnValue([]);
        imageSearchMock.mockResolvedValue([]);
        downloadImageBufferMock.mockResolvedValue({ buffer: Buffer.from('x'), contentType: 'image/jpeg' });
        convertBufferToWebpMock.mockResolvedValue(undefined);
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => vi.restoreAllMocks());

    /**
     * Verifies that items with existing `cover.*` files in their target directory are bypassed without triggering a search.
     */
    it('skips an item whose directory already has a cover.* file', async () => {
        existsSyncMock.mockReturnValue(true);
        readdirSyncMock.mockReturnValue(['cover.png']);

        await syncCoversBySearch([{ id: 1, label: 'Game A', searchQuery: 'Game A box art' }], baseOptions);

        expect(imageSearchMock).not.toHaveBeenCalled();
    });

    it('searches again when only an unfinished cover file exists', async () => {
        existsSyncMock.mockReturnValue(true);
        readdirSyncMock.mockReturnValue(['cover.webp.tmp']);

        await syncCoversBySearch([{ id: 1, label: 'Game A', searchQuery: 'Game A box art' }], baseOptions);

        expect(imageSearchMock).toHaveBeenCalledWith('Game A box art', { engines: ['bing', 'ddg'], n: 5 });
    });

    /**
     * Verifies that `imageSearch` is called with the requested query and default search engines and result count.
     */
    it('searches with the given query and default engines/result count', async () => {
        imageSearchMock.mockResolvedValue(['https://example.com/a.jpg']);

        await syncCoversBySearch([{ id: 1, label: 'Game A', searchQuery: 'Game A PC box art' }], baseOptions);

        expect(imageSearchMock).toHaveBeenCalledWith('Game A PC box art', { engines: ['bing', 'ddg'], n: 5 });
    });

    /**
     * Verifies that the top search result image is downloaded, converted to `.webp`, and saved via a temporary `.tmp` path.
     */
    it('downloads the first search result and converts it to cover.webp, regardless of source content-type', async () => {
        imageSearchMock.mockResolvedValue(['https://example.com/a.jpg', 'https://example.com/b.jpg']);
        downloadImageBufferMock.mockResolvedValue({ buffer: Buffer.from('x'), contentType: 'image/gif' });

        await syncCoversBySearch([{ id: 42, label: 'Game A', searchQuery: 'q' }], baseOptions);

        expect(downloadImageBufferMock).toHaveBeenCalledWith('https://example.com/a.jpg');
        expect(convertBufferToWebpMock).toHaveBeenCalledWith(
            expect.any(Buffer),
            expect.stringContaining('cover.webp.tmp')
        );
        expect(renameSyncMock).toHaveBeenCalledWith(
            expect.stringContaining('cover.webp.tmp'),
            expect.stringContaining('42/cover.webp')
        );
    });

    /**
     * Verifies that the item's target subdirectory is recursively created when missing.
     */
    it('creates the item directory when it does not exist yet', async () => {
        imageSearchMock.mockResolvedValue(['https://example.com/a.jpg']);
        existsSyncMock.mockReturnValue(false);

        await syncCoversBySearch([{ id: 7, label: 'Game A', searchQuery: 'q' }], baseOptions);

        expect(mkdirSyncMock).toHaveBeenCalledWith(expect.stringContaining('7'), { recursive: true });
    });

    /**
     * Verifies that when no search results are returned, a warning is logged and no download attempt is made.
     */
    it('logs a warning and does not download when no image result is found', async () => {
        imageSearchMock.mockResolvedValue([]);

        await syncCoversBySearch([{ id: 1, label: 'Game A', searchQuery: 'q' }], baseOptions);

        expect(downloadImageBufferMock).not.toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No image found'));
    });

    /**
     * Verifies that search errors on individual items are caught, logged, and do not interrupt the processing of subsequent items.
     */
    it('logs an error and continues when the search itself throws', async () => {
        imageSearchMock.mockRejectedValueOnce(new Error('search failed'));

        await syncCoversBySearch(
            [
                { id: 1, label: 'Game A', searchQuery: 'q1' },
                { id: 2, label: 'Game B', searchQuery: 'q2' },
            ],
            baseOptions
        );

        expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Search error'));
        // The second item is still processed despite the first one failing.
        expect(imageSearchMock).toHaveBeenCalledTimes(2);
    });

    /**
     * Verifies that temporary `.tmp` files are deleted if an error occurs during image download or processing.
     */
    it('cleans up the .tmp file and returns null when the download fails', async () => {
        imageSearchMock.mockResolvedValue(['https://example.com/a.jpg']);
        downloadImageBufferMock.mockRejectedValue(new Error('network down'));
        existsSyncMock.mockImplementation((path: string) => path.toString().endsWith('.tmp'));

        await syncCoversBySearch([{ id: 1, label: 'Game A', searchQuery: 'q' }], baseOptions);

        expect(unlinkSyncMock).toHaveBeenCalledWith(expect.stringContaining('.tmp'));
    });

    /**
     * Verifies that an `AbortError` triggers a specific timeout error message in console output.
     */
    it('reports an AbortError with the dedicated timeout message', async () => {
        imageSearchMock.mockResolvedValue(['https://example.com/a.jpg']);
        const abortError = new Error('Aborted');
        abortError.name = 'AbortError';
        downloadImageBufferMock.mockRejectedValue(abortError);

        await syncCoversBySearch([{ id: 1, label: 'Game A', searchQuery: 'q' }], baseOptions);

        expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Request timed out'));
    });

    /**
     * Verifies that the delay between item iterations falls within the range specified by `delayRangeMs`.
     */
    it('waits a delay within the configured range between items', async () => {
        const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
        await syncCoversBySearch(
            [{ id: 1, label: 'A', searchQuery: 'a' }],
            { ...baseOptions, delayRangeMs: [1000, 2000] }
        );

        const delay = setTimeoutSpy.mock.calls[0][1] as number;
        expect(delay).toBeGreaterThanOrEqual(1000);
        expect(delay).toBeLessThanOrEqual(2000);
        setTimeoutSpy.mockRestore();
    });

    /**
     * Verifies that user-defined `searchEngines` and `resultsPerSearch` options are forwarded to `imageSearch`.
     */
    it('respects custom search engines and result count', async () => {
        await syncCoversBySearch(
            [{ id: 1, label: 'A', searchQuery: 'a' }],
            { ...baseOptions, searchEngines: ['google'], resultsPerSearch: 3 }
        );
        expect(imageSearchMock).toHaveBeenCalledWith('a', { engines: ['google'], n: 3 });
    });

    /**
     * Verifies that `closeBrowser` is always called in the `finally` block even if an exception occurs.
     */
    it('always closes the imgsearch browser, even if an item throws', async () => {
        imageSearchMock.mockRejectedValueOnce(new Error('boom'));
        await syncCoversBySearch([{ id: 1, label: 'A', searchQuery: 'a' }], baseOptions);
        expect(closeBrowserMock).toHaveBeenCalledTimes(1);
    });
});

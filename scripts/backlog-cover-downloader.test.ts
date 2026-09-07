import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { existsSyncMock, mkdirSyncMock, writeFileSyncMock, renameSyncMock, unlinkSyncMock, readFileSyncMock, readdirSyncMock } = vi.hoisted(() => ({
    existsSyncMock: vi.fn(),
    mkdirSyncMock: vi.fn(),
    writeFileSyncMock: vi.fn(),
    renameSyncMock: vi.fn(),
    unlinkSyncMock: vi.fn(),
    readFileSyncMock: vi.fn().mockReturnValue('[]'), // Default return value to safely handle module import execution
    readdirSyncMock: vi.fn(),
}));

vi.mock('fs', () => ({
    default: {
        existsSync: existsSyncMock,
        mkdirSync: mkdirSyncMock,
        writeFileSync: writeFileSyncMock,
        renameSync: renameSyncMock,
        unlinkSync: unlinkSyncMock,
        readFileSync: readFileSyncMock,
        readdirSync: readdirSyncMock,
    },
}));

const { BingMock } = vi.hoisted(() => ({
    BingMock: vi.fn(),
}));

vi.mock('bing-image-downloader', () => ({
    Bing: BingMock,
}));

// Helper to construct a mocked Fetch Response with working headers.get()
function createMockResponse(status = 200, headersMap: Record<string, string> = {}, arrayBufferData = new ArrayBuffer(8)) {
    return {
        ok: status >= 200 && status < 300,
        status,
        headers: {
            get: (key: string) => {
                const lowerKey = key.toLowerCase();
                for (const [k, v] of Object.entries(headersMap)) {
                    if (k.toLowerCase() === lowerKey) return v;
                }
                return null;
            }
        },
        arrayBuffer: async () => arrayBufferData
    };
}

// Suppress console output during initial module import execution
const initialLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
const initialErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

// Import module (triggers top-level await run())
const { downloadImage, searchAndDownloadCover, run } = await import('./backlog-cover-downloader');

initialLogSpy.mockRestore();
initialErrorSpy.mockRestore();

describe('backlog-cover-downloader', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        existsSyncMock.mockReturnValue(false);
        mkdirSyncMock.mockReturnValue(undefined);
        writeFileSyncMock.mockReturnValue(undefined);
        renameSyncMock.mockReturnValue(undefined);
        unlinkSyncMock.mockReturnValue(undefined);
        readFileSyncMock.mockReturnValue('[]');
        readdirSyncMock.mockReturnValue([]);
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    describe('downloadImage', () => {
        it('creates the game directory if it does not exist', async () => {
            existsSyncMock.mockReturnValue(false);
            (global.fetch as any).mockResolvedValue(createMockResponse(200, { 'content-type': 'image/jpeg' }));

            await downloadImage('https://example.com/cover.jpg', 123);

            expect(mkdirSyncMock).toHaveBeenCalledWith(
                expect.stringContaining('123'),
                { recursive: true }
            );
        });

        it('skips directory creation when the game directory already exists', async () => {
            existsSyncMock.mockReturnValue(true);
            (global.fetch as any).mockResolvedValue(createMockResponse(200, { 'content-type': 'image/png' }));

            await downloadImage('https://example.com/cover.png', 456);

            expect(mkdirSyncMock).not.toHaveBeenCalled();
        });

        it('downloads an image and returns the filename', async () => {
            existsSyncMock.mockReturnValue(false);
            (global.fetch as any).mockResolvedValue(
                createMockResponse(200, { 'content-type': 'image/jpeg' }, new ArrayBuffer(100))
            );

            const result = await downloadImage('https://example.com/cover.jpg', 789);

            expect(result).toBe('cover.jpg');
            expect(writeFileSyncMock).toHaveBeenCalled();
            expect(renameSyncMock).toHaveBeenCalled();
        });

        it('handles HTTP errors gracefully', async () => {
            existsSyncMock.mockReturnValue(false);
            (global.fetch as any).mockResolvedValue(createMockResponse(404));

            const result = await downloadImage('https://example.com/missing.jpg', 999);

            expect(result).toBeNull();
        });

        it('handles network timeouts gracefully', async () => {
            existsSyncMock.mockReturnValue(false);
            (global.fetch as any).mockRejectedValue(new Error('AbortError'));

            const result = await downloadImage('https://example.com/timeout.jpg', 555);

            expect(result).toBeNull();
        });

        it('detects image type from Content-Type header', async () => {
            existsSyncMock.mockReturnValue(false);
            (global.fetch as any).mockResolvedValue(
                createMockResponse(200, { 'content-type': 'image/png; charset=utf-8' })
            );

            const result = await downloadImage('https://example.com/cover.png', 111);

            expect(result).toBe('cover.png');
        });
    });

    describe('searchAndDownloadCover', () => {
        it('searches for a game cover and attempts download', async () => {
            existsSyncMock.mockReturnValue(false);
            (global.fetch as any).mockResolvedValue(
                createMockResponse(200, { 'content-type': 'image/jpeg' }, new ArrayBuffer(100))
            );

            const game = {
                id: 1,
                title: 'Test Game',
                platform: 1
            };

            // Mock Bing.download to return a URL
            const mockBingInstance = {
                download: vi.fn().mockResolvedValue(['https://example.com/test.jpg'])
            };
            BingMock.mockImplementation(() => mockBingInstance);

            const result = await searchAndDownloadCover(game);

            expect(mockBingInstance.download).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        it('returns false when no results found', async () => {
            const mockBingInstance = {
                download: vi.fn().mockResolvedValue([])
            };
            BingMock.mockImplementation(() => mockBingInstance);

            const game = {
                id: 2,
                title: 'Obscure Game',
                platform: 2
            };

            const result = await searchAndDownloadCover(game);

            expect(result).toBe(false);
        });
    });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { existsSyncMock, mkdirSyncMock, writeFileSyncMock, renameSyncMock, unlinkSyncMock, readFileSyncMock, readdirSyncMock } = vi.hoisted(() => ({
    existsSyncMock: vi.fn(),
    mkdirSyncMock: vi.fn(),
    writeFileSyncMock: vi.fn(),
    renameSyncMock: vi.fn(),
    unlinkSyncMock: vi.fn(),
    readFileSyncMock: vi.fn(),
    readdirSyncMock: vi.fn(),
}));

vi.mock('fs', () => ({
    default: {
        existsSync: existsSyncMock,
        mkdirSync: mkdirSyncMock,
        writeFileSync: writeFileSyncMock,
        renameSyncMock: renameSyncMock,
        unlinkSync: unlinkSyncMock,
        readFileSync: readFileSyncMock,
        readdirSync: readdirSyncMock,
    },
}));

const { googleImgScrapMock } = vi.hoisted(() => ({
    googleImgScrapMock: vi.fn(),
}));

vi.mock('google-img-scrap', () => ({
    GOOGLE_IMG_SCRAP: googleImgScrapMock,
}));

// Helper to construct a mocked Fetch Response with a working .headers.get()
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

// Simulate loading the module
const { downloadImage, run } = await import('./backlog-cover-downloader');

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

        it('fetches the image with a valid User-Agent header', async () => {
            existsSyncMock.mockReturnValue(true);
            (global.fetch as any).mockResolvedValue(createMockResponse(200, { 'content-type': 'image/webp' }));

            await downloadImage('https://example.com/cover.webp', 789);

            expect(global.fetch).toHaveBeenCalledWith(
                'https://example.com/cover.webp',
                expect.objectContaining({
                    method: 'GET',
                    headers: expect.objectContaining({
                        'User-Agent': expect.stringContaining('Mozilla'),
                    }),
                })
            );
        });

        it('detects and uses the correct file extension from Content-Type', async () => {
            existsSyncMock.mockReturnValue(true);
            const testCases = [
                { contentType: 'image/jpeg', expected: 'jpg' },
                { contentType: 'image/png', expected: 'png' },
                { contentType: 'image/webp', expected: 'webp' },
                { contentType: 'image/gif', expected: 'gif' },
            ];

            for (let i = 0; i < testCases.length; i++) {
                const { contentType, expected } = testCases[i];
                (global.fetch as any).mockResolvedValueOnce(createMockResponse(200, { 'content-type': contentType }));

                const result = await downloadImage('https://example.com/cover', 100 + i);

                expect(result).toBe(`cover.${expected}`);
            }
        });

        it('defaults to jpg extension when Content-Type is unknown', async () => {
            existsSyncMock.mockReturnValue(true);
            (global.fetch as any).mockResolvedValue(createMockResponse(200, { 'content-type': 'application/octet-stream' }));

            const result = await downloadImage('https://example.com/cover', 999);

            expect(result).toBe('cover.jpg');
        });

        it('writes image data to a temporary file then renames it atomically', async () => {
            existsSyncMock.mockReturnValue(true);
            const mockBuffer = Buffer.from([1, 2, 3, 4]);
            (global.fetch as any).mockResolvedValue(createMockResponse(200, { 'content-type': 'image/jpeg' }, mockBuffer.buffer));

            await downloadImage('https://example.com/cover.jpg', 555);

            expect(writeFileSyncMock).toHaveBeenCalledWith(
                expect.stringContaining('.tmp'),
                expect.any(Buffer)
            );
            expect(renameSyncMock).toHaveBeenCalledWith(
                expect.stringContaining('.tmp'),
                expect.stringContaining('cover.jpg')
            );
        });

        it('cleans up temporary file if fetch fails', async () => {
            existsSyncMock.mockReturnValueOnce(false).mockReturnValueOnce(true);
            (global.fetch as any).mockRejectedValue(new Error('Network error'));

            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const result = await downloadImage('https://example.com/cover.jpg', 111);
            consoleErrorSpy.mockRestore();

            expect(result).toBeNull();
            expect(unlinkSyncMock).toHaveBeenCalled();
        });

        it('handles AbortError timeout gracefully', async () => {
            existsSyncMock.mockReturnValue(true);
            const abortError = new Error('Aborted');
            abortError.name = 'AbortError';
            (global.fetch as any).mockRejectedValue(abortError);

            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const result = await downloadImage('https://example.com/cover.jpg', 222);

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining("délai d'attente (timeout) a expiré")
            );
            expect(result).toBeNull();
            consoleErrorSpy.mockRestore();
        });

        it('returns null and logs error when fetch response is not ok', async () => {
            existsSyncMock.mockReturnValue(true);
            (global.fetch as any).mockResolvedValue(createMockResponse(404));

            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const result = await downloadImage('https://example.com/missing.jpg', 333);

            expect(result).toBeNull();
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('HTTP error! status: 404')
            );
            consoleErrorSpy.mockRestore();
        });

        it('strips charset from Content-Type header', async () => {
            existsSyncMock.mockReturnValue(true);
            (global.fetch as any).mockResolvedValue(createMockResponse(200, { 'content-type': 'image/jpeg; charset=utf-8' }));

            const result = await downloadImage('https://example.com/cover.jpg', 444);

            expect(result).toBe('cover.jpg');
        });

        it('handles missing Content-Type header', async () => {
            existsSyncMock.mockReturnValue(true);
            (global.fetch as any).mockResolvedValue(createMockResponse(200));

            const result = await downloadImage('https://example.com/cover', 555);

            expect(result).toBe('cover.jpg');
        });
    });

    describe('run', () => {
        it('reads the backlog JSON file', async () => {
            readFileSyncMock.mockReturnValue(JSON.stringify([]));

            await run();

            expect(readFileSyncMock).toHaveBeenCalledWith(
                expect.stringContaining('backlog.json'),
                'utf-8'
            );
        });

        it('throws when backlog.json cannot be read', async () => {
            readFileSyncMock.mockImplementation(() => {
                throw new Error('ENOENT: no such file');
            });

            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            await expect(run()).rejects.toThrow();
            consoleErrorSpy.mockRestore();
        });

        it('throws when backlog.json contains invalid JSON', async () => {
            readFileSyncMock.mockReturnValue('{ invalid json }');

            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            await expect(run()).rejects.toThrow();
            consoleErrorSpy.mockRestore();
        });

        it('skips games that already have a cover', async () => {
            const games = [
                { id: 1, title: 'Game 1', platform: 1 },
                { id: 2, title: 'Game 2', platform: 2 },
            ];
            readFileSyncMock.mockReturnValue(JSON.stringify(games));
            existsSyncMock.mockReturnValue(true);
            readdirSyncMock
                .mockReturnValueOnce(['cover.jpg'])
                .mockReturnValueOnce([]);
            googleImgScrapMock.mockResolvedValue({ result: [] });

            const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            await run();
            consoleLogSpy.mockRestore();

            expect(googleImgScrapMock).toHaveBeenCalledTimes(1);
        });

        it('constructs correct Google Image Search query with platform name', async () => {
            const games = [{ id: 1, title: 'Mario Kart', platform: 2 }];
            readFileSyncMock.mockReturnValue(JSON.stringify(games));
            readdirSyncMock.mockReturnValue([]);
            existsSyncMock.mockReturnValue(false);
            googleImgScrapMock.mockResolvedValue({ result: [] });

            await run();

            expect(googleImgScrapMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    search: 'Mario Kart GBA official box art',
                    limit: 5,
                    safeSearch: false,
                })
            );
        });

        it('handles games with unknown platform gracefully', async () => {
            const games = [{ id: 1, title: 'Unknown Game', platform: 999 }];
            readFileSyncMock.mockReturnValue(JSON.stringify(games));
            readdirSyncMock.mockReturnValue([]);
            googleImgScrapMock.mockResolvedValue({ result: [] });

            await run();

            expect(googleImgScrapMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    search: 'Unknown Game official box art',
                })
            );
        });

        it('downloads the first image result when found', async () => {
            const games = [{ id: 1, title: 'Game 1', platform: 1 }];
            const imageUrl = 'https://example.com/box.jpg';
            readFileSyncMock.mockReturnValue(JSON.stringify(games));
            readdirSyncMock.mockReturnValue([]);
            existsSyncMock.mockReturnValue(true);
            googleImgScrapMock.mockResolvedValue({
                result: [
                    { url: imageUrl },
                    { url: 'https://example.com/other.jpg' },
                ],
            });
            (global.fetch as any).mockResolvedValue(createMockResponse(200, { 'content-type': 'image/jpeg' }));

            const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            await run();
            consoleLogSpy.mockRestore();

            expect(global.fetch).toHaveBeenCalledWith(
                imageUrl,
                expect.any(Object)
            );
        });

        it('logs warning when no image is found for a game', async () => {
            const games = [{ id: 1, title: 'Obscure Game', platform: 5 }];
            readFileSyncMock.mockReturnValue(JSON.stringify(games));
            readdirSyncMock.mockReturnValue([]);
            googleImgScrapMock.mockResolvedValue({ result: [] });

            const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            await run();
            consoleLogSpy.mockRestore();

            expect(consoleLogSpy).toHaveBeenCalledWith(
                expect.stringContaining('Aucune image trouvée')
            );
        });

        it('logs error when Google Image Search fails for a game', async () => {
            const games = [{ id: 1, title: 'Game 1', platform: 1 }];
            readFileSyncMock.mockReturnValue(JSON.stringify(games));
            readdirSyncMock.mockReturnValue([]);
            googleImgScrapMock.mockRejectedValue(new Error('API rate limit'));

            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            await run();

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('Erreur lors de la recherche')
            );
            consoleErrorSpy.mockRestore();
        });

        it('waits 2 seconds between game searches', async () => {
            const games = [
                { id: 1, title: 'Game 1', platform: 1 },
                { id: 2, title: 'Game 2', platform: 1 },
            ];
            readFileSyncMock.mockReturnValue(JSON.stringify(games));
            readdirSyncMock.mockReturnValue([]);
            googleImgScrapMock.mockResolvedValue({ result: [] });

            const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
            await run();

            expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 2000);
        });

        it('processes all games in the backlog sequentially', async () => {
            vi.useFakeTimers();
            const games = [
                { id: 1, title: 'Game 1', platform: 1 },
                { id: 2, title: 'Game 2', platform: 2 },
                { id: 3, title: 'Game 3', platform: 3 },
            ];
            readFileSyncMock.mockReturnValue(JSON.stringify(games));
            readdirSyncMock.mockReturnValue([]);
            googleImgScrapMock.mockResolvedValue({ result: [] });

            const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            const runPromise = run();

            await vi.advanceTimersByTimeAsync(2000);
            await vi.advanceTimersByTimeAsync(2000);
            await vi.advanceTimersByTimeAsync(2000);

            await runPromise;
            consoleLogSpy.mockRestore();
            vi.useRealTimers();

            expect(googleImgScrapMock).toHaveBeenCalledTimes(3);
        });

        it('logs completion message at the end', async () => {
            readFileSyncMock.mockReturnValue(JSON.stringify([]));

            const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            await run();

            expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('✨ Terminé !'));
            consoleLogSpy.mockRestore();
        });
    });
});

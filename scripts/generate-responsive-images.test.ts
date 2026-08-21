import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'path';

describe('generate-responsive-images script', () => {
    let readFileMock: ReturnType<typeof vi.fn>;
    let sharpToFileCalls: string[] = [];
    let shouldThrowForGameId: string | null = null;

    const gamesJson = [
        { playlistId: 'PL1', coverFile: 'cover.jpg', title: 'Game PL1' },
    ];
    const testsJson = [
        { videoId: 'VID1', coverFile: 'cover.jpg', title: 'Test VID1' },
    ];

    beforeEach(() => {
        vi.resetModules();
        sharpToFileCalls = [];
        shouldThrowForGameId = null;

        // Mock fs/promises.readFile
        readFileMock = vi.fn(async (p: string, enc?: string) => {
            // Normalise to posix to simplify matching across platforms in tests
            const np = p.replace(/\\/g, '/');
            if (np.endsWith('/src/app/api/games/games.json')) {
                return JSON.stringify(gamesJson);
            }
            if (np.endsWith('/src/app/api/tests/tests.json')) {
                return JSON.stringify(testsJson);
            }
            // Any other readFile calls are image reads -> return Buffer
            return Buffer.from('image-data');
        });

        vi.doMock('fs/promises', () => ({
            readFile: readFileMock,
        }));

        // Mock sharp to capture toFile calls. The script calls sharp(image, { failOn: 'none' }).resize(...).toFile(...)
        vi.doMock('sharp', () => {
            return (image: any, options: any) => {
                return {
                    resize: ({ width, height, fit }: any) => {
                        return {
                            toFile: (outPath: string) => {
                                sharpToFileCalls.push(outPath);
                                // If configured, simulate an error for a particular game id (gameId included in path)
                                if (shouldThrowForGameId && outPath.includes(shouldThrowForGameId)) {
                                    return Promise.reject(new Error('simulated sharp failure'));
                                }
                                return Promise.resolve({ format: 'webp', size: 123 } as any);
                            },
                        };
                    },
                };
            };
        });

        // Silence console output in tests, but keep spies so we can assert calls
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        // Restore everything
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
        // Clear any module-level side effects between tests
        // reset any exit code
        // @ts-expect-error intentionally resetting for tests
        process.exitCode = undefined;
    });

    it('resizes all pictures for games and tests into each configured size', async () => {
        // No special error; default mode (no args) should process all pictures
        // Ensure process argv doesn't include singleGame
        // Provide at least two argv entries so slice(2) yields []
        process.argv = ['node', 'script'];

        // Import AFTER mocks are set up
        await import('./generate-responsive-images');

        // We have one game (PL1) and one test (VID1). Each is resized into 3 sizes (small, medium, big).
        // So total toFile calls = 2 entries * 3 sizes = 6
        expect(sharpToFileCalls.length).toBe(6);

        // Assert each expected output file was requested
        const expectedFiles = [
            path.join('public', 'covers', 'PL1', 'cover@small.webp'),
            path.join('public', 'covers', 'PL1', 'cover@medium.webp'),
            path.join('public', 'covers', 'PL1', 'cover@big.webp'),
            path.join('public', 'testscovers', 'VID1', 'cover@small.webp'),
            path.join('public', 'testscovers', 'VID1', 'cover@medium.webp'),
            path.join('public', 'testscovers', 'VID1', 'cover@big.webp'),
        ];

        for (const expected of expectedFiles) {
            const found = sharpToFileCalls.some(p => p.endsWith(expected));
            expect(found, `Expected resize output path ending with ${expected}, got ${JSON.stringify(sharpToFileCalls)}`).toBeTruthy();
        }

        // Ensure the JSON files were read at least once each
        expect(readFileMock).toHaveBeenCalled();
        const calledPaths = readFileMock.mock.calls.map(c => String(c[0]).replace(/\\/g, '/'));
        expect(calledPaths.some(p => p.endsWith('/src/app/api/games/games.json'))).toBeTruthy();
        expect(calledPaths.some(p => p.endsWith('/src/app/api/tests/tests.json'))).toBeTruthy();
    });

    it('resizes a single game when run in singleGame mode', async () => {
        // singleGame mode: args: [ 'singleGame', gameId, folder = 'covers', icon = 'cover.jpg' ]
        process.argv = ['node', 'script', 'singleGame', 'PL1', 'covers', 'cover.jpg'];

        await import('./generate-responsive-images');

        // Single game => 3 sizes => 3 toFile calls
        expect(sharpToFileCalls.length).toBe(3);

        const expected = path.join('public', 'covers', 'PL1', 'cover@small.webp');
        const found = sharpToFileCalls.some(p => p.endsWith(expected));
        expect(found).toBeTruthy();
    });

    it('sets process.exitCode = 1 and logs an error when resizing a game fails', async () => {
        // Configure the mock to throw for PL1
        shouldThrowForGameId = 'PL1';

        process.argv = ['node', 'script'];

        // Re-import module (mocks are already in place)
        await import('./generate-responsive-images');

        // Because we simulated a failure for PL1, the script catches per-game errors and sets process.exitCode = 1
        // @ts-expect-error process.exitCode may be undefined
        expect(process.exitCode).toBe(1);

        // Ensure console.error was called with the high level message at least once
        const errSpy = (console.error as unknown) as jest.MockedFunction<any>;
        const errorCalls = (errSpy as any).mock.calls.map((c: any[]) => String(c[0]));
        const foundMessage = errorCalls.some((m: string) => m.includes('Cannot generate responsive images for'));
        expect(foundMessage).toBeTruthy();
    });
});

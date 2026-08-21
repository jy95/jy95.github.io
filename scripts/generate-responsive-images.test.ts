import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'path';

describe('generate-responsive-images script', () => {
    let readFileMock: ReturnType<typeof vi.fn>;
    let sharpToFileCalls: string[] = [];
    let shouldThrowForGameId: string | null = null;
    let originalExitCode: number | string | null | undefined;
    let originalArgv: string[];

    const gamesJson = [
        { playlistId: 'PL1', coverFile: 'cover.jpg', title: 'Game PL1' }
    ];
    const testsJson = [
        { videoId: 'VID1', coverFile: 'cover.jpg', title: 'Test VID1' }
    ];

    beforeEach(() => {
        vi.resetModules();
        sharpToFileCalls = [];
        shouldThrowForGameId = null;
        originalExitCode = process.exitCode;
        originalArgv = process.argv;

        readFileMock = vi.fn(async (p: string, enc?: string) => {
            const np = p.replace(/\\/g, '/');

            if (np.endsWith('/src/app/api/games/games.json')) {
                return JSON.stringify(gamesJson);
            }

            if (np.endsWith('/src/app/api/tests/tests.json')) {
                return JSON.stringify(testsJson);
            }

            return Buffer.from('image-data');
        });

        vi.doMock('fs/promises', () => ({
            readFile: readFileMock
        }));

        vi.doMock('sharp', () => ({
            default: (image: any, options: any) => {
                return {
                    resize: ({ width, height, fit }: any) => {
                        return {
                            toFile: (outPath: string) => {
                                sharpToFileCalls.push(outPath);

                                if (
                                    shouldThrowForGameId &&
                                    outPath.includes(shouldThrowForGameId)
                                ) {
                                    return Promise.reject(
                                        new Error('simulated sharp failure')
                                    );
                                }

                                return Promise.resolve({
                                    format: 'webp',
                                    size: 123
                                } as any);
                            }
                        };
                    }
                };
            }
        }));

        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
        process.exitCode = originalExitCode;
        process.argv = originalArgv;
    });

    it('resizes all pictures for games and tests into each configured size', async () => {
        process.argv = ['node', 'script'];

        await import('./generate-responsive-images');

        expect(sharpToFileCalls.length).toBe(6);

        const expectedFiles = [
            path.join('public', 'covers', 'PL1', 'cover@small.webp'),
            path.join('public', 'covers', 'PL1', 'cover@medium.webp'),
            path.join('public', 'covers', 'PL1', 'cover@big.webp'),
            path.join('public', 'testscovers', 'VID1', 'cover@small.webp'),
            path.join(
                'public',
                'testscovers',
                'VID1',
                'cover@medium.webp'
            ),
            path.join('public', 'testscovers', 'VID1', 'cover@big.webp')
        ];

        for (const expected of expectedFiles) {
            const found = sharpToFileCalls.some(p => p.endsWith(expected));

            expect(
                found,
                `Expected resize output path ending with ${expected}, got ${JSON.stringify(sharpToFileCalls)}`
            ).toBeTruthy();
        }

        expect(readFileMock).toHaveBeenCalled();

        const calledPaths = readFileMock.mock.calls.map(c =>
            String(c[0]).replace(/\\/g, '/')
        );

        expect(
            calledPaths.some(p =>
                p.endsWith('/src/app/api/games/games.json')
            )
        ).toBeTruthy();
        expect(
            calledPaths.some(p =>
                p.endsWith('/src/app/api/tests/tests.json')
            )
        ).toBeTruthy();
    });

    it('resizes a single game when run in singleGame mode', async () => {
        process.argv = [
            'node',
            'script',
            'singleGame',
            'PL1',
            'covers',
            'cover.jpg'
        ];

        await import('./generate-responsive-images');

        expect(sharpToFileCalls.length).toBe(3);

        const expected = path.join(
            'public',
            'covers',
            'PL1',
            'cover@small.webp'
        );
        const found = sharpToFileCalls.some(p => p.endsWith(expected));

        expect(found).toBeTruthy();
    });

    it('sets process.exitCode = 1 and logs an error when resizing a game fails', async () => {
        shouldThrowForGameId = 'PL1';
        process.argv = ['node', 'script'];

        await import('./generate-responsive-images');

        expect(process.exitCode).toBe(1);

        const errorCalls = vi
            .mocked(console.error)
            .mock.calls.map((c: any[]) => String(c[0]));
        const foundMessage = errorCalls.some((m: string) =>
            m.includes('Cannot generate responsive images for')
        );

        expect(foundMessage).toBeTruthy();
    });
});

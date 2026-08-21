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

        readFileMock = vi.fn(async (filePath: string) => {
            const normalizedPath = filePath.replace(/\\/g, '/');

            if (normalizedPath.endsWith('/src/app/api/games/games.json')) {
                return JSON.stringify(gamesJson);
            }

            if (normalizedPath.endsWith('/src/app/api/tests/tests.json')) {
                return JSON.stringify(testsJson);
            }

            return Buffer.from('image-data');
        });

        vi.doMock('fs/promises', async () => {
            const actual =
                await vi.importActual<typeof import('fs/promises')>(
                    'fs/promises'
                );

            return {
                ...actual,
                readFile: readFileMock,
                default: {
                    ...actual,
                    readFile: readFileMock
                }
            };
        });

        vi.doMock('sharp', () => ({
            default: () => ({
                resize: () => ({
                    toFile: (outputPath: string) => {
                        sharpToFileCalls.push(outputPath);

                        if (
                            shouldThrowForGameId &&
                            outputPath.includes(shouldThrowForGameId)
                        ) {
                            return Promise.reject(
                                new Error('simulated sharp failure')
                            );
                        }

                        return Promise.resolve({
                            format: 'webp',
                            size: 123
                        });
                    }
                })
            })
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

        expect(sharpToFileCalls).toHaveLength(6);

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

        for (const expectedFile of expectedFiles) {
            expect(
                sharpToFileCalls.some(outputPath =>
                    outputPath.endsWith(expectedFile)
                ),
                `Expected resize output path ending with ${expectedFile}, got ${JSON.stringify(sharpToFileCalls)}`
            ).toBe(true);
        }

        const calledPaths = readFileMock.mock.calls.map(([filePath]) =>
            String(filePath).replace(/\\/g, '/')
        );

        expect(
            calledPaths.some(filePath =>
                filePath.endsWith('/src/app/api/games/games.json')
            )
        ).toBe(true);
        expect(
            calledPaths.some(filePath =>
                filePath.endsWith('/src/app/api/tests/tests.json')
            )
        ).toBe(true);
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

        expect(sharpToFileCalls).toHaveLength(3);

        const expectedFile = path.join(
            'public',
            'covers',
            'PL1',
            'cover@small.webp'
        );

        expect(
            sharpToFileCalls.some(outputPath =>
                outputPath.endsWith(expectedFile)
            )
        ).toBe(true);
    });

    it('sets process.exitCode to 1 and logs an error when resizing a game fails', async () => {
        shouldThrowForGameId = 'PL1';
        process.argv = ['node', 'script'];

        await import('./generate-responsive-images');

        expect(process.exitCode).toBe(1);

        expect(
            vi
                .mocked(console.error)
                .mock.calls.some(([message]) =>
                    String(message).includes(
                        'Cannot generate responsive images for'
                    )
                )
        ).toBe(true);
    });
});

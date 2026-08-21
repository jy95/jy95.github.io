import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { readFileMock } = vi.hoisted(() => ({
    readFileMock: vi.fn(),
}));

const { createReadStreamMock } = vi.hoisted(() => ({
    createReadStreamMock: vi.fn(),
}));

const { sharpMock, cloneMock, resizeMock, toFileMock } = vi.hoisted(() => {
    const toFileMock = vi.fn().mockResolvedValue({});
    const resizeMock = vi.fn(() => ({ toFile: toFileMock }));
    const cloneMock = vi.fn(() => ({ resize: resizeMock }));
    const sharpMock = vi.fn(() => ({ clone: cloneMock }));

    return { sharpMock, cloneMock, resizeMock, toFileMock };
}));

vi.mock('fs/promises', async (importOriginal) => {
    const actual = await importOriginal<typeof import('fs/promises')>();

    return {
        ...actual,
        readFile: readFileMock,
        default: {
            ...actual.default,
            readFile: readFileMock,
        },
    };
});

vi.mock('fs', async (importOriginal) => {
    const actual = await importOriginal<typeof import('fs')>();

    return {
        ...actual,
        createReadStream: createReadStreamMock,
        default: {
            ...actual.default,
            createReadStream: createReadStreamMock,
        },
    };
});

vi.mock('sharp', () => ({
    default: sharpMock,
}));

describe('scripts/generate-responsive-images.ts', () => {
    const originalArgv = process.argv.slice();

    let consoleLogSpy: ReturnType<typeof vi.spyOn>;
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        vi.resetModules();

        readFileMock.mockReset();
        createReadStreamMock.mockReset();
        sharpMock.mockClear();
        cloneMock.mockClear();
        resizeMock.mockClear();
        toFileMock.mockClear();

        createReadStreamMock.mockImplementation(() => ({
            pipe: vi.fn(),
        }));

        readFileMock.mockImplementation(async (file) => {
            if (String(file).includes('tests.json')) {
                return JSON.stringify([
                    {
                        playlistId: 't1',
                        coverFile: 'cover.webp',
                        title: 'Test Game',
                    },
                ]);
            }

            return JSON.stringify([
                {
                    playlistId: 'g1',
                    coverFile: 'cover.webp',
                    title: 'Real Game',
                },
            ]);
        });

        consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        process.argv = originalArgv.slice();
        vi.restoreAllMocks();
    });

    it('generates responsive images for all games when no arguments are provided', async () => {
        process.argv = ['node', 'generate-responsive-images'];

        await import('./generate-responsive-images');

        await vi.waitFor(() => {
            expect(toFileMock).toHaveBeenCalledTimes(6);
        });

        expect(createReadStreamMock).toHaveBeenCalledTimes(2);
        expect(sharpMock).toHaveBeenCalledTimes(2);

        expect(resizeMock).toHaveBeenCalledWith({
            width: 150,
            height: 150,
            fit: 'inside',
        });
        expect(resizeMock).toHaveBeenCalledWith({
            width: 200,
            height: 200,
            fit: 'inside',
        });
        expect(resizeMock).toHaveBeenCalledWith({
            width: 250,
            height: 250,
            fit: 'inside',
        });

        expect(consoleLogSpy).toHaveBeenCalledWith('Resize all pictures ....');
        expect(consoleLogSpy).toHaveBeenCalledWith('Real Game - finished');
        expect(consoleLogSpy).toHaveBeenCalledWith('Test Game - finished');
    });

    it('generates responsive images for one game in singleGame mode', async () => {
        process.argv = [
            'node',
            'generate-responsive-images',
            'singleGame',
            'SINGLE_ID',
            'covers',
            'custom-cover.png',
        ];

        await import('./generate-responsive-images');

        await vi.waitFor(() => {
            expect(toFileMock).toHaveBeenCalledTimes(3);
        });

        expect(createReadStreamMock).toHaveBeenCalledTimes(1);
        expect(sharpMock).toHaveBeenCalledTimes(1);
        expect(createReadStreamMock).toHaveBeenCalledWith(
            expect.stringContaining('/public/covers/SINGLE_ID/custom-cover.png')
        );

        expect(resizeMock).toHaveBeenCalledWith({
            width: 150,
            height: 150,
            fit: 'inside',
        });
        expect(resizeMock).toHaveBeenCalledWith({
            width: 200,
            height: 200,
            fit: 'inside',
        });
        expect(resizeMock).toHaveBeenCalledWith({
            width: 250,
            height: 250,
            fit: 'inside',
        });

        expect(consoleLogSpy).toHaveBeenCalledWith('Resize single game');
        expect(consoleLogSpy).toHaveBeenCalledWith('SINGLE_ID - finished');
    });

    it('logs an error and does not resize when singleGame has no game ID', async () => {
        process.argv = ['node', 'generate-responsive-images', 'singleGame'];

        await import('./generate-responsive-images');

        expect(toFileMock).not.toHaveBeenCalled();
        expect(createReadStreamMock).not.toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error: gameId is required for singleGame mode.'
        );
    });
});

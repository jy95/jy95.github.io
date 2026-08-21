import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Hoisted mocks so they are set up before the module under test is imported.
const { readFileMock } = vi.hoisted(() => ({
    readFileMock: vi.fn(),
}));

const { createReadStreamMock } = vi.hoisted(() => ({
    // createReadStream will return a minimal object that exposes pipe()
    createReadStreamMock: vi.fn(() => ({ pipe: () => {} })),
}));

const { sharpMock, toFileMock, resizeMock, cloneMock } = vi.hoisted(() => {
    const toFileMock = vi.fn().mockResolvedValue({} as any);

    // resize() returns an object with toFile()
    const resizeMock = vi.fn(() => ({ toFile: toFileMock }));

    // clone() returns an object that also supports resize()
    const cloneMock = vi.fn(() => ({ resize: resizeMock }));

    // sharp(...) returns an object with clone and resize (the code pipes a readable stream
    // into the returned object and later calls .clone().resize(...).toFile(...))
    const sharpMock = vi.fn(() => ({ clone: cloneMock, resize: resizeMock }));

    return { sharpMock, toFileMock, resizeMock, cloneMock };
});

// Mock fs/promises.readFile used at module top-level to load JSON files
vi.mock('fs/promises', async (importOriginal) => {
    const actual = await importOriginal<typeof import('fs/promises')>();
    return {
        ...actual,
        readFile: readFileMock,
        default: { ...actual, readFile: readFileMock },
    };
});

// Mock createReadStream from 'fs'
vi.mock('fs', () => ({
    createReadStream: createReadStreamMock,
}));

// Mock sharp
vi.mock('sharp', () => ({ default: sharpMock }));

describe('scripts/generate-responsive-images.ts', () => {
    let consoleLogSpy: ReturnType<typeof vi.spyOn>;
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
    const originalArgv = process.argv.slice();

    beforeEach(() => {
        // Ensure a clean module cache so the script runs fresh for each test.
        vi.resetModules();

        // Reset mocks
        readFileMock.mockReset();
        createReadStreamMock.mockReset();
        sharpMock.mockClear();
        toFileMock.mockClear();
        resizeMock.mockClear();
        cloneMock.mockClear();

        // Provide default behavior for createReadStream (safe no-op pipe)
        createReadStreamMock.mockImplementation(() => ({ pipe: () => {} }));

        // Default content returned for the two JSON files the script reads.
        // The module reads tests.json and games.json — respond differently depending on path.
        readFileMock.mockImplementation(async (file: string) => {
            // simple guard to return different payloads depending on filename
            if (String(file).includes('tests.json')) {
                return JSON.stringify([
                    { playlistId: 't1', coverFile: 'cover.webp', title: 'Test Game' },
                ]);
            }
            // default to games.json
            return JSON.stringify([
                { playlistId: 'g1', coverFile: 'cover.webp', title: 'Real Game' },
            ]);
        });

        consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        // restore argv and console spies
        process.argv = originalArgv.slice();
        vi.restoreAllMocks();
    });

    it('generates responsive images for all games (two stores) when no args are provided', async () => {
        // Ensure no extra CLI args so the module chooses the default branch.
        process.argv = ['node', 'generate-responsive-images'];

        // Import the module; the script runs on import (top-level await).
        await import('./generate-responsive-images');

        // We have two stores: 'games' and 'tests', each with one entry in our mocks.
        // Each entry generates 3 sizes (small, medium, big) -> total toFile calls = 2 * 3 = 6
        expect(toFileMock).toHaveBeenCalledTimes(6);

        // Ensure sharp was constructed at least once
        expect(sharpMock).toHaveBeenCalled();

        // Basic log assertion to show the script ran
        expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('runs singleGame mode and resizes a single game from arguments', async () => {
        // Simulate CLI: singleGame <gameId> <folder> <icon>
        process.argv = ['node', 'generate-responsive-images', 'singleGame', 'SINGLE_ID', 'covers', 'custom-cover.png'];

        await import('./generate-responsive-images');

        // single game -> 3 sizes
        expect(toFileMock).toHaveBeenCalledTimes(3);

        // The "Resize single game" message should have been logged
        expect(consoleLogSpy).toHaveBeenCalledWith('Resize single game');
    });

    it('logs an error and does nothing when singleGame is called without a gameId', async () => {
        process.argv = ['node', 'generate-responsive-images', 'singleGame'];

        await import('./generate-responsive-images');

        // No resize should have happened
        expect(toFileMock).not.toHaveBeenCalled();

        // Error message about missing gameId should be emitted
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error: gameId is required for singleGame mode.');
    });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mkdirMock, rmMock, renameMock } = vi.hoisted(() => ({
    mkdirMock: vi.fn(),
    rmMock: vi.fn(),
    renameMock: vi.fn(),
}));

vi.mock('node:fs/promises', async (importOriginal) => {
    const actual = await importOriginal<typeof import('node:fs/promises')>();
    const mock = { ...actual, mkdir: mkdirMock, rm: rmMock, rename: renameMock };
    return { ...mock, default: mock };
});

const { replaceCoverAtomically } = await import('./coverReplace');

/**
 * Unit test suite for `replaceCoverAtomically`.
 * Tests atomic directory replacement, staging folder creation, error handling, and staging preservation behavior.
 */
describe('replaceCoverAtomically', () => {
    beforeEach(() => {
        mkdirMock.mockReset().mockResolvedValue(undefined);
        rmMock.mockReset().mockResolvedValue(undefined);
        renameMock.mockReset().mockResolvedValue(undefined);
    });

    /**
     * Verifies that a temporary staging directory is created alongside the target directory (in the same parent folder).
     */
    it('creates a staging directory sibling to the final directory', async () => {
        await replaceCoverAtomically('/pub/covers/abc', async () => {});

        expect(mkdirMock).toHaveBeenCalledWith(
            expect.stringMatching(/\/pub\/covers\/\.staging-/),
            { recursive: true }
        );
    });

    /**
     * Verifies that the provided `writeInto` callback is invoked with the path to the temporary staging directory.
     */
    it('calls writeInto with the staging directory path', async () => {
        const writeInto = vi.fn().mockResolvedValue(undefined);
        await replaceCoverAtomically('/pub/covers/abc', writeInto);

        expect(writeInto).toHaveBeenCalledWith(expect.stringMatching(/\.staging-/));
    });

    /**
     * Verifies that upon successful file creation, the old directory is removed and the staging directory is renamed into place.
     */
    it('removes the old final directory then renames staging into place', async () => {
        await replaceCoverAtomically('/pub/covers/abc', async () => {});

        expect(rmMock).toHaveBeenCalledWith('/pub/covers/abc', { recursive: true, force: true });
        expect(renameMock).toHaveBeenCalledWith(expect.stringMatching(/\.staging-/), '/pub/covers/abc');
    });

    /**
     * Verifies that if file writing inside `writeInto` throws an error, the temporary staging directory is cleaned up and the atomic rename is aborted.
     */
    it('cleans up staging when writeInto itself throws', async () => {
        await expect(
            replaceCoverAtomically('/pub/covers/abc', async () => {
                throw new Error('download failed');
            })
        ).rejects.toThrow('download failed');

        expect(rmMock).toHaveBeenCalledWith(expect.stringMatching(/\.staging-/), { recursive: true, force: true });
        expect(renameMock).not.toHaveBeenCalled();
    });

    /**
     * Verifies that if the rename operation fails after writing, the staging directory is preserved for inspection and not deleted.
     */
    it('preserves staging and reports its path when the atomic rename fails', async () => {
        renameMock.mockRejectedValueOnce(new Error('EBUSY'));

        await expect(replaceCoverAtomically('/pub/covers/abc', async () => {})).rejects.toThrow(
            /Failed to complete cover replacement.*staging preserved at/
        );

        // Only the final-dir rm happened; staging itself must not be cleaned up.
        expect(rmMock).toHaveBeenCalledTimes(1);
        expect(rmMock).toHaveBeenCalledWith('/pub/covers/abc', { recursive: true, force: true });
    });

    /**
     * Verifies that each execution generates a unique staging directory path using unique identifiers to prevent collisions.
     */
    it('gives every call a distinct staging directory', async () => {
        const seen = new Set<string>();
        await replaceCoverAtomically('/pub/covers/abc', async (dir) => { seen.add(dir); });
        await replaceCoverAtomically('/pub/covers/abc', async (dir) => { seen.add(dir); });
        expect(seen.size).toBe(2);
    });
});
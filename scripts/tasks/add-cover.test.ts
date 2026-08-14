import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { mkdirMock, rmMock, renameMock } = vi.hoisted(() => ({
    mkdirMock: vi.fn(),
    rmMock: vi.fn(),
    renameMock: vi.fn(),
}));

vi.mock('fs/promises', async (importOriginal) => {
    const actual = await importOriginal<typeof import('fs/promises')>();
    const mock = {
        ...actual,
        mkdir: mkdirMock,
        rm: rmMock,
        rename: renameMock,
    };
    return {
        ...mock,
        default: mock,
    };
});

const { sharpMock, toFileMock } = vi.hoisted(() => {
    const toFileMock = vi.fn().mockResolvedValue(undefined);
    const webpMock = vi.fn(() => ({ toFile: toFileMock }));
    const resizeMock = vi.fn(() => ({ webp: webpMock }));
    const sharpMock = vi.fn(() => ({ resize: resizeMock }));
    return { sharpMock, toFileMock };
});

vi.mock('sharp', () => ({ default: sharpMock }));

const { addCover } = await import('./add-cover');

describe('addCover', () => {
    beforeEach(() => {
        mkdirMock.mockReset().mockResolvedValue(undefined);
        rmMock.mockReset().mockResolvedValue(undefined);
        renameMock.mockReset().mockResolvedValue(undefined);
        sharpMock.mockClear();
        toFileMock.mockClear().mockResolvedValue(undefined);
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('throws when required fields are missing', async () => {
        await expect(
            addCover({} as any, { imageURL: '', folder: 'covers', identifierValue: 'abc' } as any)
        ).rejects.toThrow('Missing required fields');
    });

    it('throws for an invalid folder', async () => {
        await expect(
            addCover({} as any, {
                imageURL: 'https://example.com/img.jpg',
                folder: 'not-a-folder' as any,
                identifierValue: 'abc',
            })
        ).rejects.toThrow(/Invalid folder name/);
    });

    it('downloads, converts and swaps the cover on success', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            arrayBuffer: async () => new ArrayBuffer(8),
        });

        await addCover({} as any, {
            imageURL: 'https://example.com/img.jpg',
            folder: 'covers',
            identifierValue: 'test-game-id',
        });

        expect(mkdirMock).toHaveBeenCalled();
        expect(global.fetch).toHaveBeenCalledWith('https://example.com/img.jpg', expect.any(Object));
        expect(sharpMock).toHaveBeenCalled();
        expect(toFileMock).toHaveBeenCalled();
        expect(rmMock).toHaveBeenCalled();
        expect(renameMock).toHaveBeenCalled();
    });

    it('throws when the image download responds with a non-ok status', async () => {
        (global.fetch as any).mockResolvedValue({ ok: false, status: 404 });

        await expect(
            addCover({} as any, {
                imageURL: 'https://example.com/missing.jpg',
                folder: 'covers',
                identifierValue: 'test-game-404',
            })
        ).rejects.toThrow(/Failed to download image/);

        // Early failure (before the swap) must clean up the staging directory.
        expect(rmMock).toHaveBeenCalled();
        expect(renameMock).not.toHaveBeenCalled();
    });

    it('throws when the fetch call itself rejects', async () => {
        (global.fetch as any).mockRejectedValue(new Error('network down'));

        await expect(
            addCover({} as any, {
                imageURL: 'https://example.com/img.jpg',
                folder: 'covers',
                identifierValue: 'test-game-network-fail',
            })
        ).rejects.toThrow(/Failed to download image/);
    });

    it('throws when image conversion fails', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            arrayBuffer: async () => new ArrayBuffer(8),
        });
        toFileMock.mockRejectedValueOnce(new Error('bad image'));

        await expect(
            addCover({} as any, {
                imageURL: 'https://example.com/img.jpg',
                folder: 'covers',
                identifierValue: 'test-game-convert-fail',
            })
        ).rejects.toThrow(/Failed to convert and resize image/);
    });

    it('throws and preserves staging when the atomic rename swap fails', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            arrayBuffer: async () => new ArrayBuffer(8),
        });
        renameMock.mockRejectedValueOnce(new Error('EBUSY'));

        await expect(
            addCover({} as any, {
                imageURL: 'https://example.com/img.jpg',
                folder: 'covers',
                identifierValue: 'test-game-swap-fail',
            })
        ).rejects.toThrow(/Failed to complete cover replacement/);
    });

    it('rejects an identifier that attempts path traversal', async () => {
        await expect(
            addCover({} as any, {
                imageURL: 'https://example.com/img.jpg',
                folder: 'covers',
                identifierValue: '../../etc/passwd',
            })
        ).rejects.toThrow(/path traversal detected/);
    });

    it('accepts every valid folder value', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            arrayBuffer: async () => new ArrayBuffer(8),
        });

        for (const folder of ['covers', 'testscovers', 'backlogcovers'] as const) {
            await expect(
                addCover({} as any, {
                    imageURL: 'https://example.com/img.jpg',
                    folder,
                    identifierValue: `id-${folder}`,
                })
            ).resolves.toBeUndefined();
        }
    });
});
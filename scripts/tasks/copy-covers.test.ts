import { describe, it, expect, vi, beforeEach } from 'vitest';

const { accessMock, cpMock } = vi.hoisted(() => ({
    accessMock: vi.fn(),
    cpMock: vi.fn(),
}));

vi.mock('fs/promises', async (importOriginal) => {
    const actual = await importOriginal<typeof import('fs/promises')>();
    const mock = {
        ...actual,
        access: accessMock,
        cp: cpMock,
    };
    return {
        ...mock,
        default: mock,
    };
});

const { copyCovers } = await import('./copy-covers');

describe('copyCovers', () => {
    beforeEach(() => {
        accessMock.mockReset();
        cpMock.mockReset();
    });

    it('throws for an invalid source folder', async () => {
        await expect(
            copyCovers({} as any, {
                sourceFolder: 'not-a-folder' as any,
                destinationFolder: 'covers',
                source_games_textarea: 'a',
                destination_games_textarea: 'b',
            })
        ).rejects.toThrow(/Invalid folder name/);
    });

    it('throws for an invalid destination folder', async () => {
        await expect(
            copyCovers({} as any, {
                sourceFolder: 'covers',
                destinationFolder: 'not-a-folder' as any,
                source_games_textarea: 'a',
                destination_games_textarea: 'b',
            })
        ).rejects.toThrow(/Invalid folder name/);
    });

    it('throws when no source IDs are provided', async () => {
        await expect(
            copyCovers({} as any, {
                sourceFolder: 'covers',
                destinationFolder: 'testscovers',
                source_games_textarea: '',
                destination_games_textarea: 'b',
            })
        ).rejects.toThrow('No source IDs provided in source_games_textarea');
    });

    it('throws when no destination IDs are provided', async () => {
        await expect(
            copyCovers({} as any, {
                sourceFolder: 'covers',
                destinationFolder: 'testscovers',
                source_games_textarea: 'a',
                destination_games_textarea: '',
            })
        ).rejects.toThrow('No destination IDs provided in destination_games_textarea');
    });

    it('copies successfully when the source folder exists', async () => {
        accessMock.mockResolvedValue(undefined);
        cpMock.mockResolvedValue(undefined);

        const result = await copyCovers({} as any, {
            sourceFolder: 'covers',
            destinationFolder: 'testscovers',
            source_games_textarea: 'abc123',
            destination_games_textarea: 'xyz789',
        });

        expect(result.totalPairs).toBe(1);
        expect(result.successCount).toBe(1);
        expect(result.errorCount).toBe(0);
        expect(result.details[0]).toMatchObject({ sourceId: 'abc123', destId: 'xyz789', success: true });
        expect(cpMock).toHaveBeenCalledWith(
            expect.stringContaining('abc123'),
            expect.stringContaining('xyz789'),
            expect.objectContaining({ recursive: true, force: true })
        );
    });

    it('reports a failure note when the source folder does not exist on disk', async () => {
        accessMock.mockRejectedValue(new Error('ENOENT'));

        const result = await copyCovers({} as any, {
            sourceFolder: 'covers',
            destinationFolder: 'testscovers',
            source_games_textarea: 'missing123',
            destination_games_textarea: 'dest123',
        });

        expect(result.successCount).toBe(0);
        expect(result.errorCount).toBe(1);
        expect(result.details[0].note).toMatch(/Source folder not found/);
        expect(cpMock).not.toHaveBeenCalled();
    });

    it('reports a failure note when the copy itself throws', async () => {
        accessMock.mockResolvedValue(undefined);
        cpMock.mockRejectedValue(new Error('disk full'));

        const result = await copyCovers({} as any, {
            sourceFolder: 'covers',
            destinationFolder: 'testscovers',
            source_games_textarea: 'abc123',
            destination_games_textarea: 'xyz789',
        });

        expect(result.successCount).toBe(0);
        expect(result.errorCount).toBe(1);
        expect(result.details[0].note).toMatch(/Error copying/);
    });

    it('processes only the min number of pairs and warns when lengths differ', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        accessMock.mockResolvedValue(undefined);
        cpMock.mockResolvedValue(undefined);

        const result = await copyCovers({} as any, {
            sourceFolder: 'covers',
            destinationFolder: 'testscovers',
            source_games_textarea: 'a\nb\nc',
            destination_games_textarea: 'x\ny',
        });

        expect(result.totalPairs).toBe(2);
        expect(warnSpy).toHaveBeenCalled();
        warnSpy.mockRestore();
    });

    it('processes multiple pairs in order and aggregates results', async () => {
        accessMock.mockResolvedValue(undefined);
        cpMock.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('boom'));

        const result = await copyCovers({} as any, {
            sourceFolder: 'covers',
            destinationFolder: 'testscovers',
            source_games_textarea: 'a\nb',
            destination_games_textarea: 'x\ny',
        });

        expect(result.totalPairs).toBe(2);
        expect(result.successCount).toBe(1);
        expect(result.errorCount).toBe(1);
        expect(result.details[0].success).toBe(true);
        expect(result.details[1].success).toBe(false);
    });

    it('throws for a source id that attempts path traversal', async () => {
        await expect(
            copyCovers({} as any, {
                sourceFolder: 'covers',
                destinationFolder: 'testscovers',
                source_games_textarea: '../../etc/passwd',
                destination_games_textarea: 'dest',
            })
        ).rejects.toThrow(/escapes the allowed directory/);
    });

    it('throws for a destination id that attempts path traversal', async () => {
        accessMock.mockResolvedValue(undefined);
        await expect(
            copyCovers({} as any, {
                sourceFolder: 'covers',
                destinationFolder: 'testscovers',
                source_games_textarea: 'valid-id',
                destination_games_textarea: '../../etc/passwd',
            })
        ).rejects.toThrow(/escapes the allowed directory/);
    });
});
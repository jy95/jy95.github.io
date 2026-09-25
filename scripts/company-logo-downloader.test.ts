import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { openDatabaseMock, syncCoversBySearchMock, allMock, closeMock, prepareMock } = vi.hoisted(() => {
    const allMock = vi.fn();
    const closeMock = vi.fn();
    const prepareMock = vi.fn(() => ({ all: allMock }));
    return {
        openDatabaseMock: vi.fn(() => ({ prepare: prepareMock, close: closeMock })),
        syncCoversBySearchMock: vi.fn().mockResolvedValue(undefined),
        allMock,
        closeMock,
        prepareMock,
    };
});

vi.mock('./common/db', () => ({ openDatabase: openDatabaseMock }));
vi.mock('./common/coverSearchRunner', () => ({ syncCoversBySearch: syncCoversBySearchMock }));

/**
 * Unit test suite for `company-logo-downloader`.
 * Tests read-only DB access, query shape, search-item mapping ("<name> logo"),
 * output root path, and that the DB connection is always closed.
 */
describe('company-logo-downloader', () => {
    beforeEach(() => {
        vi.resetModules();
        openDatabaseMock.mockClear();
        syncCoversBySearchMock.mockClear().mockResolvedValue(undefined);
        allMock.mockReset().mockReturnValue([]);
        closeMock.mockClear();
        prepareMock.mockClear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('opens the database in read-only mode', async () => {
        await import('./company-logo-downloader');
        expect(openDatabaseMock).toHaveBeenCalledWith({ readonly: true });
    });

    it('queries only id and name from the companies table', async () => {
        await import('./company-logo-downloader');
        expect(prepareMock).toHaveBeenCalledWith('SELECT id, name FROM companies');
    });

    it('builds one search item per company, with a "<name> logo" query', async () => {
        allMock.mockReturnValue([
            { id: 1, name: 'Capcom' },
            { id: 2, name: 'Insomniac Games' },
        ]);

        await import('./company-logo-downloader');

        expect(syncCoversBySearchMock).toHaveBeenCalledWith(
            [
                { id: 1, label: 'Capcom', searchQuery: 'Capcom logo' },
                { id: 2, label: 'Insomniac Games', searchQuery: 'Insomniac Games logo' },
            ],
            expect.objectContaining({ outputRoot: expect.stringContaining('public/companies') })
        );
    });

    it('passes an empty item list through when there are no companies', async () => {
        allMock.mockReturnValue([]);
        await import('./company-logo-downloader');
        expect(syncCoversBySearchMock).toHaveBeenCalledWith([], expect.any(Object));
    });

    it('closes the database connection after a successful run', async () => {
        allMock.mockReturnValue([{ id: 1, name: 'Sega' }]);
        await import('./company-logo-downloader');
        expect(closeMock).toHaveBeenCalledTimes(1);
    });

    it('still closes the database connection when the search step throws', async () => {
        allMock.mockReturnValue([{ id: 1, name: 'Sega' }]);
        syncCoversBySearchMock.mockRejectedValueOnce(new Error('search failed'));

        await expect(import('./company-logo-downloader')).rejects.toThrow('search failed');
        expect(closeMock).toHaveBeenCalledTimes(1);
    });

    it('uses the companies output root under the public directory', async () => {
        allMock.mockReturnValue([{ id: 1, name: 'Sega' }]);
        await import('./company-logo-downloader');

        const outputRoot = syncCoversBySearchMock.mock.calls[0][1].outputRoot as string;
        expect(outputRoot.replaceAll('\\', '/')).toMatch(/public\/companies$/);
    });
});

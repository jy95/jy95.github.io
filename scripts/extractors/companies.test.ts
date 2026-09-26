import { describe, it, expect, vi, beforeEach } from 'vitest';

const { writeFileMock } = vi.hoisted(() => ({
    writeFileMock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('node:fs/promises', () => ({
    writeFile: writeFileMock,
}));

import { extractAndSaveCompanies } from './companies';

describe('extractAndSaveCompanies', () => {
    beforeEach(() => {
        writeFileMock.mockClear();
    });

    it('queries companies_games_as_json and writes the stringified result', async () => {
        const allMock = vi.fn().mockReturnValue([{ id: 1, name: 'Acme' }]);
        const prepareMock = vi.fn(() => ({ all: allMock }));
        const db = { prepare: prepareMock } as any;

        await extractAndSaveCompanies(db, '/tmp/companies.json');

        expect(prepareMock).toHaveBeenCalledWith('SELECT * FROM companies_games_as_json');
        expect(allMock).toHaveBeenCalledTimes(1);
        expect(writeFileMock).toHaveBeenCalledTimes(1);
        const [path, contents, encoding] = writeFileMock.mock.calls[0];
        expect(path).toBe('/tmp/companies.json');
        expect(encoding).toBe('utf-8');
        expect(JSON.parse(contents as string)).toEqual([{ id: 1, name: 'Acme' }]);
    });

    it('writes an empty array when the query returns no rows', async () => {
        const db = { prepare: vi.fn(() => ({ all: vi.fn().mockReturnValue([]) })) } as any;

        await extractAndSaveCompanies(db, '/tmp/empty.json');

        const contents = writeFileMock.mock.calls[0][1] as string;
        expect(JSON.parse(contents)).toEqual([]);
    });

    it('logs a success message including the output path', async () => {
        const db = { prepare: vi.fn(() => ({ all: vi.fn().mockReturnValue([]) })) } as any;
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        await extractAndSaveCompanies(db, '/tmp/out.json');

        expect(logSpy).toHaveBeenCalledWith('/tmp/out.json successfully written');
        logSpy.mockRestore();
    });
});

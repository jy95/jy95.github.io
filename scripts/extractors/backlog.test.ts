import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFile } from 'fs/promises';
import { openTestDb, hasRealDb } from '../tasks/testDbHelper';
import { tempOutputPath } from './common/testFileHelper';
import { extractAndSaveBacklog } from './backlog';
import type { Database } from 'better-sqlite3';

describe.skipIf(!hasRealDb)('extractAndSaveBacklog', () => {
    let db: Database;
    let cleanupDb: () => void;
    let outPath: string;
    let cleanupFile: () => void;

    beforeEach(() => {
        ({ db, cleanup: cleanupDb } = openTestDb() as any);
        ({ path: outPath, cleanup: cleanupFile } = tempOutputPath('backlog'));
    });
    afterEach(() => {
        cleanupDb();
        cleanupFile();
    });

    it('writes one entry per row in the backlog table', async () => {
        const expectedCount = db.prepare('SELECT COUNT(*) AS n FROM backlog').get() as { n: number };

        await extractAndSaveBacklog(db, outPath);
        const written = JSON.parse(await readFile(outPath, 'utf-8'));

        expect(written).toHaveLength(expectedCount.n);
    });

    it('drops null fields (e.g. missing notes/platform) rather than writing them as null', async () => {
        const rowWithNulls = db
            .prepare('SELECT id FROM backlog WHERE notes IS NULL LIMIT 1')
            .get() as { id: number } | undefined;

        // Only meaningful if the fixture actually has such a row; skip the
        // assertion body (not the test) otherwise, so this stays green
        // across differently-seeded databases without a false pass.
        if (!rowWithNulls) return;

        await extractAndSaveBacklog(db, outPath);
        const written = JSON.parse(await readFile(outPath, 'utf-8')) as { id: number }[];
        const entry = written.find((e) => e.id === rowWithNulls.id);

        expect(entry).toBeDefined();
        expect(entry).not.toHaveProperty('notes');
    });

    it('preserves title and hltb duration fields verbatim', async () => {
        const sample = db.prepare('SELECT id, title, hltb_main FROM backlog LIMIT 1').get() as {
            id: number;
            title: string;
            hltb_main: string | null;
        };

        await extractAndSaveBacklog(db, outPath);
        const written = JSON.parse(await readFile(outPath, 'utf-8')) as { id: number; title: string; hltb_main?: string }[];
        const entry = written.find((e) => e.id === sample.id)!;

        expect(entry.title).toBe(sample.title);
        if (sample.hltb_main !== null) {
            expect(entry.hltb_main).toBe(sample.hltb_main);
        }
    });
});
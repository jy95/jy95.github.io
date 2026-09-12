import { beforeEach, afterEach } from 'vitest';
import { openTestDb } from '../../tasks/testDbHelper';
import { tempOutputPath } from './testFileHelper';
import type { Database } from 'better-sqlite3';

export function useExtractorHarness(name: string) {
    const ctx: { db: Database; outPath: string } = {} as any;
    let cleanupDb: () => void;
    let cleanupFile: () => void;

    beforeEach(() => {
        ({ db: ctx.db, cleanup: cleanupDb } = openTestDb());
        ({ path: ctx.outPath, cleanup: cleanupFile } = tempOutputPath(name));
    });
    afterEach(() => { cleanupDb(); cleanupFile(); });

    return ctx;
}
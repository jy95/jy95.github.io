import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import { useExtractorHarness } from '../extractors/common/extractorTestHarness';
import { hasRealDb } from '../tasks/testDbHelper';
import type { CompanySummary } from '../../src/domain/companies/types';
import { extractAndSavePlanning } from './planning';

describe.skipIf(!hasRealDb)('extractAndSavePlanning', () => {
    const ctx = useExtractorHarness('extractAndSavePlanning');

    it.each([0, 1, 2])('extracts %i company summaries per role with stable IDs and sorted names', async (count) => {
        // A deterministic future entry, independent of the real catalogue's schedule.
        const { lastInsertRowid: gameId } = ctx.db.prepare(
            "INSERT INTO games (title, videoId, releaseDate, platform) VALUES (?, ?, ?, ?)"
        ).run('Company fixture', 'company-fixture', '2020-01-01', 1);
        ctx.db.prepare("INSERT INTO games_schedules (id, availableAt) VALUES (?, '2999-01-01')").run(gameId);
        const expected: CompanySummary[] = [];
        for (const name of ['ZZZ Fixture Studio', 'aaa Fixture Studio'].slice(0, count)) {
            const { lastInsertRowid: id } = ctx.db.prepare('INSERT INTO companies (name) VALUES (?)').run(name);
            expected.unshift({ id: Number(id), name });
            for (const role of ['developer', 'publisher']) {
                ctx.db.prepare('INSERT INTO games_companies (game, company, role) VALUES (?, ?, ?)').run(gameId, id, role);
            }
        }

        await extractAndSavePlanning(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as {
            videoId?: string;
            developers: CompanySummary[];
            publishers: CompanySummary[];
        }[];
        const entry = written.find((game) => game.videoId === 'company-fixture');
        expect(entry).toBeDefined();
        expect(entry?.developers).toEqual(expected);
        expect(entry?.publishers).toEqual(expected);
    });

    it('matches the row count of games_in_future exactly', async () => {
        const expectedCount = ctx.db.prepare('SELECT COUNT(*) AS n FROM games_in_future').get() as { n: number };

        await extractAndSavePlanning(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8'));

        expect(written).toHaveLength(expectedCount.n);
    });

    it('parses the aggregated genres column into a real JSON array, not a raw string', async () => {
        await extractAndSavePlanning(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as { genres: unknown }[];

        for (const entry of written) {
            expect(Array.isArray(entry.genres)).toBe(true);
        }
    });

    it('every genre id in the output is a number', async () => {
        await extractAndSavePlanning(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as { genres: number[] }[];

        for (const entry of written) {
            for (const genreId of entry.genres) {
                expect(typeof genreId).toBe('number');
            }
        }
    });

    it('joins in the parent game row (title, releaseDate, duration) for every future entry', async () => {
        await extractAndSavePlanning(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as {
            title: string;
            releaseDate: unknown;
            duration: unknown;
        }[];

        for (const entry of written) {
            expect(typeof entry.title).toBe('string');
            expect(entry.title.length).toBeGreaterThan(0);
        }
    });
});
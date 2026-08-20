import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { Database as SQLDatabase } from 'better-sqlite3';

import { fetchGamesWithPlaylists, fetchGamesWithVideos } from './findPublishedGames';
import { openTestDb, hasRealDb } from './tasks/testDbHelper';

describe.skipIf(!hasRealDb)('findPublishedGames', () => {
        let db: SQLDatabase;
        let cleanup: () => void;

        beforeEach(() => {
            const opened = openTestDb();
            db = opened.db;
            cleanup = opened.cleanup;
        });

        afterEach(() => {
            cleanup();
        });

        it('fetchGamesWithPlaylists returns an array of objects with identifier and title, with unique identifiers', () => {
            const years = new Set(['2026', '2025', '2024']);
            const results = fetchGamesWithPlaylists(db, years);

            // Basic shape checks
            expect(Array.isArray(results)).toBe(true);
            for (const row of results) {
                expect(row).toHaveProperty('identifier');
                expect(row).toHaveProperty('title');
                expect(typeof row.identifier).toBe('string');
                expect(typeof row.title).toBe('string');
            }

            // Identifiers should be unique (function uses a Map to dedupe)
            const ids = results.map(r => r.identifier);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);
        });

        it('fetchGamesWithVideos returns an array of objects with identifier and title, with unique identifiers', () => {
            const years = new Set(['2026', '2025']);
            const results = fetchGamesWithVideos(db, years);

            // Basic shape checks
            expect(Array.isArray(results)).toBe(true);
            for (const row of results) {
                expect(row).toHaveProperty('identifier');
                expect(row).toHaveProperty('title');
                expect(typeof row.identifier).toBe('string');
                expect(typeof row.title).toBe('string');
            }

            // Identifiers should be unique (function uses a Map to dedupe)
            const ids = results.map(r => r.identifier);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);
        });

        it('returns an empty array for an empty set of years', () => {
            const emptyYears = new Set<string>();
            const playlists = fetchGamesWithPlaylists(db, emptyYears);
            const videos = fetchGamesWithVideos(db, emptyYears);

            expect(playlists).toEqual([]);
            expect(videos).toEqual([]);
        });
});

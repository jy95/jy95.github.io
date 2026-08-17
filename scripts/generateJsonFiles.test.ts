// scripts/generateJsonFiles.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('generateJsonFiles script', () => {
    const extractorNames = [
        'extractAndSaveBacklog',
        'extractAndSaveGames',
        'extractAndSaveSeries',
        'extractAndSaveTests',
        'extractAndSaveStats',
        'extractAndSavePlatforms',
        'extractAndSaveGenres',
        'extractAndSavePlanning',
        'extractAndSavePastGames',
        'extractAndSaveDLCS',
        'extractAndSaveRandomList',
        'extractAndSavePastGamesToFeeds',
        'extractAndSaveTierListGames',
        'extractAndSaveTierListBacklog',
        'extractAndSaveTierListCategories',
        'extractAndSaveTierListGamesFuture',
        'extractAndSaveTierListTests',
    ];

    // Expected filename suffixes (should match FILES defined in generateJsonFiles.ts)
    const expectedSuffixes: Record<string, string[]> = {
        extractAndSavePlatforms: ['src/app/api/platforms/platforms.json'],
        extractAndSaveGenres: ['src/app/api/genres/genres.json'],
        extractAndSaveBacklog: ['src/app/api/backlog/backlog.json'],
        extractAndSavePlanning: ['src/app/api/planning/planning.json'],
        extractAndSaveGames: ['src/app/api/games/games.json'],
        extractAndSaveSeries: ['src/app/api/series/series.json'],
        extractAndSaveTests: ['src/app/api/tests/tests.json'],
        extractAndSaveStats: ['src/app/api/stats/stats.json'],
        extractAndSavePastGames: ['src/app/api/planning/past-planning.json'],
        extractAndSaveDLCS: ['src/app/api/dlcs/dlcs.json'],
        extractAndSaveRandomList: ['src/app/api/random/identifiers.json'],
        extractAndSavePastGamesToFeeds: ['public/rss.xml', 'public/feed.json'],
        extractAndSaveTierListGames: ['src/app/api/tier-lists/games/games.json'],
        extractAndSaveTierListBacklog: ['src/app/api/tier-lists/backlog/backlog.json'],
        extractAndSaveTierListCategories: ['src/app/api/tier-lists/categories/categories.json'],
        extractAndSaveTierListGamesFuture: ['src/app/api/tier-lists/games/future-games.json'],
        extractAndSaveTierListTests: ['src/app/api/tier-lists/tests/tests.json'],
    };

    let mockDb: any;
    let constructedDbArgs: { path?: string; options?: any } | null = null;
    let extractorMocks: Record<string, ReturnType<typeof vi.fn>> = {};

    beforeEach(() => {
        vi.resetModules();
        constructedDbArgs = null;

        // Create a mock DB object with a spyable close method
        mockDb = {
            close: vi.fn(),
            // Some extractors might call read queries in other scripts in other tests;
            // here we expose a minimal prepare/run/get API just in case.
            prepare: vi.fn(() => ({ run: vi.fn(), all: vi.fn(), get: vi.fn() })),
        };

        // Prepare extractor mocks
        extractorMocks = {};
        for (const name of extractorNames) {
            // All extractor mocks are async functions that record their arguments and resolve
            extractorMocks[name] = vi.fn(async (...args: any[]) => {
                // Return a generic resolved value; tests will assert calls rather than return values
                return;
            });
        }

        // Mock the './extractors' module with our mocks
        vi.doMock('./extractors', () => {
            const exported: Record<string, any> = {};
            for (const name of extractorNames) {
                exported[name] = extractorMocks[name];
            }
            return exported;
        });

        // Mock better-sqlite3's default export (Database)
        vi.doMock('better-sqlite3', () => {
            return {
                default: class MockDatabase {
                    constructor(path: string, options: any) {
                        // record how the Database was constructed and return our mock DB
                        constructedDbArgs = { path, options };
                        return mockDb;
                    }
                },
            };
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('calls every extractor with the database and the expected output paths, and closes the DB', async () => {
        // Import the module under test AFTER mocks are set up
        await import('./generateJsonFiles');

        // Ensure the Database constructor was called with a readonly option
        expect(constructedDbArgs).toBeTruthy();
        expect(constructedDbArgs!.options).toBeDefined();
        // The script sets readonly: true when opening the DB
        expect(constructedDbArgs!.options.readonly).toBe(true);

        // Verify each extractor was called once with the mock DB and a path argument that endsWith one of the expected suffixes
        for (const name of Object.keys(extractorMocks)) {
            const mockFn = extractorMocks[name];
            expect(mockFn).toHaveBeenCalledTimes(1);

            const callArgs = mockFn.mock.calls[0];
            // First arg must be the DB instance
            expect(callArgs[0]).toBe(mockDb);

            // Collect string args in the call (file paths)
            const stringArgs = callArgs.slice(1).filter(a => typeof a === 'string') as string[];

            const expected = expectedSuffixes[name];
            if (!expected) {
                // If we didn't list expected suffixes for a given extractor, at least ensure it was called with at least one string path
                expect(stringArgs.length).toBeGreaterThanOrEqual(0);
            } else {
                // Ensure each expected suffix is present among stringArgs (some extractors expect multiple paths)
                for (const suffix of expected) {
                    const found = stringArgs.some(sa => sa.endsWith(suffix));
                    expect(found, `${name} was not passed a path ending with ${suffix}, got ${JSON.stringify(stringArgs)}`).toBeTruthy();
                }
            }
        }

        // DB should be closed once in the finally block
        expect(mockDb.close).toHaveBeenCalledTimes(1);
    });

    it('still closes the DB if an extractor throws', async () => {
        // Make one extractor throw to trigger the error path and finally block
        const failingExtractor = 'extractAndSaveGames';
        extractorMocks[failingExtractor].mockImplementation(async () => {
            throw new Error('simulated failure');
        });

        // Importing the module should reject because the top-level await encounters the thrown error
        await expect(import('./generateJsonFiles')).rejects.toThrow('simulated failure');

        // DB must still have been closed in the finally block
        expect(mockDb.close).toHaveBeenCalledTimes(1);
    });
});

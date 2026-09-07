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
        extractAndSaveTierListGames: [
            'src/app/api/tier-lists/games/games.json',
        ],
        extractAndSaveTierListBacklog: [
            'src/app/api/tier-lists/backlog/backlog.json',
        ],
        extractAndSaveTierListCategories: [
            'src/app/api/tier-lists/categories/categories.json',
        ],
        extractAndSaveTierListGamesFuture: [
            'src/app/api/tier-lists/games/future-games.json',
        ],
        extractAndSaveTierListTests: [
            'src/app/api/tier-lists/tests/tests.json',
        ],
    };

    /**
     * Normalize filesystem paths so assertions work on every platform.
     * Windows uses `\`, while POSIX systems use `/`.
     */
    const normalizePath = (value: string): string =>
        value.replaceAll('\\', '/');

    let mockDb: any;
    let constructedDbArgs: { path?: string; options?: any } | null = null;
    let extractorMocks: Record<string, ReturnType<typeof vi.fn>> = {};

    beforeEach(() => {
        vi.resetModules();
        constructedDbArgs = null;

        mockDb = {
            close: vi.fn(),
            prepare: vi.fn(() => ({
                run: vi.fn(),
                all: vi.fn(),
                get: vi.fn(),
            })),
        };

        extractorMocks = {};

        for (const name of extractorNames) {
            extractorMocks[name] = vi.fn(async (..._args: any[]) => {
                return;
            });
        }

        vi.doMock('./extractors', () => {
            const exported: Record<string, any> = {};

            for (const name of extractorNames) {
                exported[name] = extractorMocks[name];
            }

            return exported;
        });

        vi.doMock('better-sqlite3', () => {
            return {
                default: class MockDatabase {
                    constructor(path: string, options: any) {
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
        await import('./generateJsonFiles');

        expect(constructedDbArgs).toBeTruthy();
        expect(constructedDbArgs!.options).toBeDefined();
        expect(constructedDbArgs!.options.readonly).toBe(true);

        for (const name of Object.keys(extractorMocks)) {
            const mockFn = extractorMocks[name];

            expect(mockFn).toHaveBeenCalledTimes(1);

            const callArgs = mockFn.mock.calls[0];

            // First argument must be the database.
            expect(callArgs[0]).toBe(mockDb);

            // Extract all string arguments, which are expected to be paths.
            const stringArgs = callArgs
                .slice(1)
                .filter((arg): arg is string => typeof arg === 'string')
                .map(normalizePath);

            const expected = expectedSuffixes[name];

            if (!expected) {
                expect(stringArgs.length).toBeGreaterThanOrEqual(0);
                continue;
            }

            for (const suffix of expected) {
                const normalizedSuffix = normalizePath(suffix);

                const found = stringArgs.some((path) =>
                    path.endsWith(normalizedSuffix),
                );

                expect(
                    found,
                    `${name} was not passed a path ending with ${normalizedSuffix}, got ${JSON.stringify(stringArgs)}`,
                ).toBe(true);
            }
        }

        expect(mockDb.close).toHaveBeenCalledTimes(1);
    });

    it('still closes the DB if an extractor throws', async () => {
        const failingExtractor = 'extractAndSaveGames';

        extractorMocks[failingExtractor].mockImplementation(async () => {
            throw new Error('simulated failure');
        });

        await expect(import('./generateJsonFiles')).rejects.toThrow(
            'simulated failure',
        );

        expect(mockDb.close).toHaveBeenCalledTimes(1);
    });
});
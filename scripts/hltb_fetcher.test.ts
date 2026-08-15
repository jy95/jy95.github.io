import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { openTestDb, hasRealDb } from './tasks/testDbHelper';
import type { Database as SQLDatabase } from 'better-sqlite3';

const searchOneMock = vi.fn();

vi.mock('howlongtobeat-ts', () => {
    return {
        HowLongToBeatService: class {
            searchOne = searchOneMock;
        },
    };
});

describe.skipIf(!hasRealDb)('hltb_fetcher', () => {
    let db: SQLDatabase;
    let cleanup: () => void;

    beforeEach(() => {
        vi.resetModules();
        searchOneMock.mockReset();

        // 1. Initialize real test DB instance
        ({ db, cleanup } = openTestDb());

        // 2. Prevent hltb_fetcher's finally block from closing the database connection
        (db as any).close = () => {};

        // 3. Dynamically mock better-sqlite3 so hltb_fetcher reuses our test database
        vi.doMock('better-sqlite3', () => {
            return {
                default: class {
                    constructor() {
                        return db;
                    }
                },
            };
        });

        // 4. Fast-forward delay timers synchronously
        vi.stubGlobal('setTimeout', (cb: (...args: any[]) => void) => {
            cb();
            return 1 as unknown as NodeJS.Timeout;
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
        if (db) {
            delete (db as any).close; // Restore prototype method
            cleanup();
        }
    });

    it('clears backlog, inserts a single fake entry and updates HLTB durations', async () => {
        db.prepare('DELETE FROM backlog').run();

        const testId = 999999;
        db.prepare('INSERT INTO backlog (id, title) VALUES (?, ?)').run(testId, 'Test HLTB Game');

        searchOneMock.mockResolvedValue({
            success: true,
            data: {
                mainTime: 3661,         // 01:01:01
                mainExtraTime: 90,     // 00:01:30
                completionistTime: 7322 // 02:02:02
            }
        });

        await import('./hltb_fetcher');

        const row = db.prepare('SELECT hltb_main, hltb_extra, hltb_completionist FROM backlog WHERE id = ?').get(testId) as any;

        expect(row).toBeDefined();
        expect(row.hltb_main).toBe('01:01:01');
        expect(row.hltb_extra).toBe('00:01:30');
        expect(row.hltb_completionist).toBe('02:02:02');
    });

    it('handles HLTB search errors and leaves hltb_* as null', async () => {
        db.prepare('DELETE FROM backlog').run();
        const testId = 888888;
        db.prepare('INSERT INTO backlog (id, title) VALUES (?, ?)').run(testId, 'Search Error Game');

        searchOneMock.mockRejectedValue(new Error('simulated HLTB error'));

        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        await import('./hltb_fetcher');

        errSpy.mockRestore();

        const row = db.prepare('SELECT hltb_main, hltb_extra, hltb_completionist FROM backlog WHERE id = ?').get(testId) as any;

        expect(row).toBeDefined();
        expect(row.hltb_main == null).toBeTruthy();
        expect(row.hltb_extra == null).toBeTruthy();
        expect(row.hltb_completionist == null).toBeTruthy();
    });
});

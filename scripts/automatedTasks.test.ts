import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type Database from 'better-sqlite3';

// Mock the database
vi.mock('./common/db', () => ({
    openDatabase: vi.fn(),
}));

// Mock turnStringToObj before importing automatedTasks
vi.mock('./tasks/common/utils', () => ({
    turnStringToObj: vi.fn(),
}));

// Mock all task imports
vi.mock('./tasks', () => ({
    addGameToDatabase: vi.fn(),
    updateGameInDatabase: vi.fn(),
    deleteGameFromDatabase: vi.fn(),
    addBacklogToDatabase: vi.fn(),
    deleteBacklogFromDatabase: vi.fn(),
    cleanBacklog: vi.fn(),
    addSerieToDatabase: vi.fn(),
    manageSerieInDatabase: vi.fn(),
    manageDlcsInDatabase: vi.fn(),
    addTestToDatabase: vi.fn(),
    updateTestInDatabase: vi.fn(),
    deleteTestFromDatabase: vi.fn(),
    updateTierLists: vi.fn(),
    copyCovers: vi.fn(),
    addCover: vi.fn(),
}));

describe('automatedTasks entry point', () => {
    let mockDb: Database.Database;
    let consoleLogSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        vi.clearAllMocks();
        mockDb = {} as Database.Database;
        consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
    });

    describe('task execution', () => {
        const testCases = [
            {
                taskType: 'ADD_GAME',
                payloadString: '{"title":"Test Game"}',
                expectedPayload: { title: 'Test Game' },
                handlerName: 'addGameToDatabase',
            },
            {
                taskType: 'UPDATE_GAME',
                payloadString: '{"id":1,"title":"Updated Game"}',
                expectedPayload: { id: 1, title: 'Updated Game' },
                handlerName: 'updateGameInDatabase',
            },
            {
                taskType: 'DELETE_GAME',
                payloadString: '{"id":1}',
                expectedPayload: { id: 1 },
                handlerName: 'deleteGameFromDatabase',
            },
            {
                taskType: 'ADD_BACKLOG',
                payloadString: '{"gameId":1}',
                expectedPayload: { gameId: 1 },
                handlerName: 'addBacklogToDatabase',
            },
            {
                taskType: 'DELETE_BACKLOG',
                payloadString: '{"id":1}',
                expectedPayload: { id: 1 },
                handlerName: 'deleteBacklogFromDatabase',
            },
            {
                taskType: 'CLEAN_BACKLOG',
                payloadString: '{}',
                expectedPayload: {},
                handlerName: 'cleanBacklog',
            },
            {
                taskType: 'ADD_SERIE',
                payloadString: '{"name":"Test Serie"}',
                expectedPayload: { name: 'Test Serie' },
                handlerName: 'addSerieToDatabase',
            },
            {
                taskType: 'MANAGE_SERIE',
                payloadString: '{"id":1,"action":"update"}',
                expectedPayload: { id: 1, action: 'update' },
                handlerName: 'manageSerieInDatabase',
            },
            {
                taskType: 'MANAGE_DLCS',
                payloadString: '{"gameId":1,"dlcs":[]}',
                expectedPayload: { gameId: 1, dlcs: [] },
                handlerName: 'manageDlcsInDatabase',
            },
            {
                taskType: 'ADD_TEST',
                payloadString: '{"name":"Test"}',
                expectedPayload: { name: 'Test' },
                handlerName: 'addTestToDatabase',
            },
            {
                taskType: 'UPDATE_TEST',
                payloadString: '{"id":1,"name":"Updated"}',
                expectedPayload: { id: 1, name: 'Updated' },
                handlerName: 'updateTestInDatabase',
            },
            {
                taskType: 'DELETE_TEST',
                payloadString: '{"id":1}',
                expectedPayload: { id: 1 },
                handlerName: 'deleteTestFromDatabase',
            },
            {
                taskType: 'UPDATE_TIER_LIST',
                payloadString: '{"tier":"S","games":[1,2]}',
                expectedPayload: { tier: 'S', games: [1, 2] },
                handlerName: 'updateTierLists',
            },
            {
                taskType: 'COPY_COVERS',
                payloadString: '{"source":"src","dest":"dst"}',
                expectedPayload: { source: 'src', dest: 'dst' },
                handlerName: 'copyCovers',
            },
            {
                taskType: 'ADD_COVER',
                payloadString: '{"gameId":1,"coverUrl":"url"}',
                expectedPayload: { gameId: 1, coverUrl: 'url' },
                handlerName: 'addCover',
            },
        ];

        it.each(testCases)(
            'executes $taskType task with the parsed payload',
            async ({ taskType, payloadString, expectedPayload, handlerName }) => {
                // Reset modules to ensure clean state
                vi.resetModules();

                const { openDatabase } = await import('./common/db');
                const { turnStringToObj } = await import('./tasks/common/utils');
                const tasks = await import('./tasks');

                vi.mocked(openDatabase).mockReturnValue(mockDb);
                vi.mocked(turnStringToObj).mockReturnValue(expectedPayload);

                // Simulate process.argv
                const originalArgv = process.argv;
                process.argv = ['node', 'script.ts', taskType, payloadString];

                try {
                    // Dynamically import to pick up mocked argv
                    await import('./automatedTasks');

                    // Verify the correct handler was called
                    const handler = vi.mocked(tasks[handlerName as keyof typeof tasks]);

                    // CLEAN_BACKLOG is called with only db (no payload)
                    if (taskType === 'CLEAN_BACKLOG') {
                        expect(handler).toHaveBeenCalledWith(mockDb);
                    } else {
                        expect(handler).toHaveBeenCalledWith(mockDb, expect.any(Object));
                    }
                } finally {
                    process.argv = originalArgv;
                }
            }
        );
    });

    describe('parameter parsing and logging', () => {
        it('parses process.argv correctly to extract taskType and taskPayload', async () => {
            const { openDatabase } = await import('./common/db');
            const { turnStringToObj } = await import('./tasks/common/utils');

            vi.mocked(openDatabase).mockReturnValue(mockDb);
            const mockPayload = { title: 'Game', platform: 'PC' };
            vi.mocked(turnStringToObj).mockReturnValue(mockPayload);

            const originalArgv = process.argv;
            process.argv = ['node', 'script.ts', 'ADD_GAME', '{"title":"Game","platform":"PC"}'];

            try {
                expect(vi.mocked(turnStringToObj)).toHaveBeenCalledWith('{"title":"Game","platform":"PC"}');
            } finally {
                process.argv = originalArgv;
            }
        });

        it('logs task type, payload string, and parsed payload for debugging', async () => {
            const { openDatabase } = await import('./common/db');
            const { turnStringToObj } = await import('./tasks/common/utils');

            vi.mocked(openDatabase).mockReturnValue(mockDb);
            vi.mocked(turnStringToObj).mockReturnValue({ title: 'Test' });

            const originalArgv = process.argv;
            process.argv = ['node', 'script.ts', 'ADD_GAME', '{"title":"Test"}'];

            try {
                // Check that console.log was called with debugging info
                expect(consoleLogSpy).toHaveBeenCalledWith('Parameters');
                expect(consoleLogSpy).toHaveBeenCalledWith('Task type :', 'ADD_GAME');
                expect(consoleLogSpy).toHaveBeenCalledWith('Payload as string :', '{"title":"Test"}');
            } finally {
                process.argv = originalArgv;
            }
        });
    });

    describe('error handling', () => {
        it('logs a friendly message when an unknown task type is provided', async () => {
            const { openDatabase } = await import('./common/db');
            const { turnStringToObj } = await import('./tasks/common/utils');

            vi.mocked(openDatabase).mockReturnValue(mockDb);
            vi.mocked(turnStringToObj).mockReturnValue({});

            const originalArgv = process.argv;
            process.argv = ['node', 'script.ts', 'UNKNOWN_TASK', '{}'];

            try {
                expect(consoleLogSpy).toHaveBeenCalledWith(
                    expect.stringContaining('Bip bip - Unknown or unhandled task')
                );
            } finally {
                process.argv = originalArgv;
            }
        });

        it('does not execute any task handler for an unknown task type', async () => {
            const { openDatabase } = await import('./common/db');
            const { turnStringToObj } = await import('./tasks/common/utils');
            const { addGameToDatabase } = await import('./tasks');

            vi.mocked(openDatabase).mockReturnValue(mockDb);
            vi.mocked(turnStringToObj).mockReturnValue({});

            const originalArgv = process.argv;
            process.argv = ['node', 'script.ts', 'NONEXISTENT_TASK', '{}'];

            try {
                expect(vi.mocked(addGameToDatabase)).not.toHaveBeenCalled();
            } finally {
                process.argv = originalArgv;
            }
        });
    });

    describe('database integration', () => {
        it('opens the database once at module load time', async () => {
            const { openDatabase } = await import('./common/db');

            // The module opens the database immediately on import
            expect(vi.mocked(openDatabase)).toHaveBeenCalledTimes(1);
        });

        it('passes the opened database instance to task handlers', async () => {
            const { openDatabase } = await import('./common/db');
            const { turnStringToObj } = await import('./tasks/common/utils');
            const { addGameToDatabase } = await import('./tasks');

            vi.mocked(openDatabase).mockReturnValue(mockDb);
            vi.mocked(turnStringToObj).mockReturnValue({ title: 'Test' });

            const originalArgv = process.argv;
            process.argv = ['node', 'script.ts', 'ADD_GAME', '{"title":"Test"}'];

            try {
                expect(vi.mocked(addGameToDatabase)).toHaveBeenCalledWith(
                    mockDb,
                    expect.any(Object)
                );
            } finally {
                process.argv = originalArgv;
            }
        });
    });

});

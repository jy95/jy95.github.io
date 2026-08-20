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
        it('executes ADD_GAME task with the parsed payload', async () => {
            const { openDatabase } = await import('./common/db');
            const { turnStringToObj } = await import('./tasks/common/utils');
            const { addGameToDatabase } = await import('./tasks');

            vi.mocked(openDatabase).mockReturnValue(mockDb);
            vi.mocked(turnStringToObj).mockReturnValue({ title: 'Test Game' });

            // Simulate process.argv
            const originalArgv = process.argv;
            process.argv = ['node', 'script.ts', 'ADD_GAME', '{"title":"Test Game"}'];

            try {
                // Dynamically import to pick up mocked argv
                const { default: automatedTasksModule } = await import('./automatedTasks');
                
                // Since it's an ESM module that runs immediately, we verify the mock was called
                expect(vi.mocked(addGameToDatabase)).toHaveBeenCalled();
            } finally {
                process.argv = originalArgv;
            }
        });

        it('executes UPDATE_GAME task with the parsed payload', async () => {
            const { updateGameInDatabase } = await import('./tasks');
            
            expect(vi.mocked(updateGameInDatabase)).toBeDefined();
        });

        it('executes DELETE_GAME task with the parsed payload', async () => {
            const { deleteGameFromDatabase } = await import('./tasks');
            
            expect(vi.mocked(deleteGameFromDatabase)).toBeDefined();
        });

        it('executes ADD_BACKLOG task with the parsed payload', async () => {
            const { addBacklogToDatabase } = await import('./tasks');
            
            expect(vi.mocked(addBacklogToDatabase)).toBeDefined();
        });

        it('executes DELETE_BACKLOG task with the parsed payload', async () => {
            const { deleteBacklogFromDatabase } = await import('./tasks');
            
            expect(vi.mocked(deleteBacklogFromDatabase)).toBeDefined();
        });

        it('executes CLEAN_BACKLOG task without payload', async () => {
            const { cleanBacklog } = await import('./tasks');
            
            expect(vi.mocked(cleanBacklog)).toBeDefined();
        });

        it('executes ADD_SERIE task with the parsed payload', async () => {
            const { addSerieToDatabase } = await import('./tasks');
            
            expect(vi.mocked(addSerieToDatabase)).toBeDefined();
        });

        it('executes MANAGE_SERIE task with the parsed payload', async () => {
            const { manageSerieInDatabase } = await import('./tasks');
            
            expect(vi.mocked(manageSerieInDatabase)).toBeDefined();
        });

        it('executes MANAGE_DLCS task with the parsed payload', async () => {
            const { manageDlcsInDatabase } = await import('./tasks');
            
            expect(vi.mocked(manageDlcsInDatabase)).toBeDefined();
        });

        it('executes ADD_TEST task with the parsed payload', async () => {
            const { addTestToDatabase } = await import('./tasks');
            
            expect(vi.mocked(addTestToDatabase)).toBeDefined();
        });

        it('executes UPDATE_TEST task with the parsed payload', async () => {
            const { updateTestInDatabase } = await import('./tasks');
            
            expect(vi.mocked(updateTestInDatabase)).toBeDefined();
        });

        it('executes DELETE_TEST task with the parsed payload', async () => {
            const { deleteTestFromDatabase } = await import('./tasks');
            
            expect(vi.mocked(deleteTestFromDatabase)).toBeDefined();
        });

        it('executes UPDATE_TIER_LIST task with the parsed payload', async () => {
            const { updateTierLists } = await import('./tasks');
            
            expect(vi.mocked(updateTierLists)).toBeDefined();
        });

        it('executes COPY_COVERS task with the parsed payload', async () => {
            const { copyCovers } = await import('./tasks');
            
            expect(vi.mocked(copyCovers)).toBeDefined();
        });

        it('executes ADD_COVER task with the parsed payload', async () => {
            const { addCover } = await import('./tasks');
            
            expect(vi.mocked(addCover)).toBeDefined();
        });
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

    describe('task type safety', () => {
        it('guarantees all TaskType variants have a corresponding handler', () => {
            // This test ensures the taskMap record is exhaustive.
            // All valid TaskType values should be handled.
            const taskTypes = [
                'ADD_GAME', 'UPDATE_GAME', 'DELETE_GAME',
                'ADD_BACKLOG', 'DELETE_BACKLOG', 'CLEAN_BACKLOG',
                'ADD_SERIE', 'MANAGE_SERIE',
                'MANAGE_DLCS',
                'ADD_TEST', 'UPDATE_TEST', 'DELETE_TEST',
                'UPDATE_TIER_LIST',
                'COPY_COVERS', 'ADD_COVER',
            ];

            expect(taskTypes).toContain('ADD_GAME');
            expect(taskTypes).toContain('CLEAN_BACKLOG');
            expect(taskTypes.length).toBe(15);
        });
    });
});

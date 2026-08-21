import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type Database from 'better-sqlite3';

const mocks = vi.hoisted(() => ({
    openDatabase: vi.fn(),
    turnStringToObj: vi.fn(),
    tasks: {
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
    },
}));

vi.mock('./common/db', () => ({
    openDatabase: mocks.openDatabase,
}));

vi.mock('./tasks/common/utils', () => ({
    turnStringToObj: mocks.turnStringToObj,
}));

vi.mock('./tasks', () => mocks.tasks);

type TaskHandlerName = keyof typeof mocks.tasks;

type TaskCase = {
    taskType: string;
    payloadString: string;
    expectedPayload: object;
    handlerName: TaskHandlerName;
    hasPayload?: boolean;
};

const taskCases: TaskCase[] = [
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
        hasPayload: false,
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

describe('automatedTasks entry point', () => {
    let mockDb: Database.Database;
    let consoleLogSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        mockDb = {} as Database.Database;
        consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
    });

    async function runAutomatedTask(
        taskType: string,
        payloadString: string,
        parsedPayload: object
    ): Promise<void> {
        vi.resetModules();
        vi.clearAllMocks();

        mocks.openDatabase.mockReturnValue(mockDb);
        mocks.turnStringToObj.mockReturnValue(parsedPayload);

        const originalArgv = process.argv;
        process.argv = ['node', 'automatedTasks.ts', taskType, payloadString];

        try {
            await import('./automatedTasks');
        } finally {
            process.argv = originalArgv;
        }
    }

    describe('task execution', () => {
        it.each(taskCases)(
            'executes $taskType with the parsed payload',
            async ({ taskType, payloadString, expectedPayload, handlerName, hasPayload = true }) => {
                await runAutomatedTask(taskType, payloadString, expectedPayload);

                const handler = mocks.tasks[handlerName];

                if (hasPayload) {
                    expect(handler).toHaveBeenCalledOnce();
                    expect(handler).toHaveBeenCalledWith(mockDb, expectedPayload);
                } else {
                    expect(handler).toHaveBeenCalledOnce();
                    expect(handler).toHaveBeenCalledWith(mockDb);
                }
            }
        );
    });

    describe('parameter parsing and logging', () => {
        it('parses process.argv to get the task type and payload', async () => {
            const payloadString = '{"title":"Game","platform":"PC"}';
            const parsedPayload = { title: 'Game', platform: 'PC' };

            await runAutomatedTask('ADD_GAME', payloadString, parsedPayload);

            expect(mocks.turnStringToObj).toHaveBeenCalledOnce();
            expect(mocks.turnStringToObj).toHaveBeenCalledWith(payloadString);
            expect(mocks.tasks.addGameToDatabase).toHaveBeenCalledWith(mockDb, parsedPayload);
        });

        it('logs the task type, payload string, and parsed payload', async () => {
            const payloadString = '{"title":"Test"}';
            const parsedPayload = { title: 'Test' };

            await runAutomatedTask('ADD_GAME', payloadString, parsedPayload);

            expect(consoleLogSpy).toHaveBeenCalledWith('Parameters');
            expect(consoleLogSpy).toHaveBeenCalledWith('Task type :', 'ADD_GAME');
            expect(consoleLogSpy).toHaveBeenCalledWith('Payload as string :', payloadString);
            expect(consoleLogSpy).toHaveBeenCalledWith('Payload as object :', parsedPayload);
        });
    });

    describe('error handling', () => {
        it('logs a message for an unknown task type', async () => {
            await runAutomatedTask('UNKNOWN_TASK', '{}', {});

            expect(consoleLogSpy).toHaveBeenCalledWith(
                'Bip bip - Unknown or unhandled task: "UNKNOWN_TASK"'
            );
        });

        it('does not execute a task handler for an unknown task type', async () => {
            await runAutomatedTask('NONEXISTENT_TASK', '{}', {});

            for (const handler of Object.values(mocks.tasks)) {
                expect(handler).not.toHaveBeenCalled();
            }
        });
    });

    describe('database integration', () => {
        it('opens the database once when the entry point loads', async () => {
            await runAutomatedTask('UNKNOWN_TASK', '{}', {});

            expect(mocks.openDatabase).toHaveBeenCalledOnce();
            expect(mocks.openDatabase).toHaveBeenCalledWith();
        });

        it('passes the opened database instance to the selected handler', async () => {
            const parsedPayload = { title: 'Test' };

            await runAutomatedTask('ADD_GAME', '{"title":"Test"}', parsedPayload);

            expect(mocks.tasks.addGameToDatabase).toHaveBeenCalledOnce();
            expect(mocks.tasks.addGameToDatabase).toHaveBeenCalledWith(mockDb, parsedPayload);
        });
    });
});

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Types
import type { TaskType } from './tasks/common/types';

// Utils
import { turnStringToObj } from './tasks/common/utils';

const __dirname = dirname(fileURLToPath(import.meta.url));
const databasePath = resolve(__dirname, '..', 'GamesPassionFR.db');
const db = new Database(databasePath, { verbose: console.log });

// Parse positional arguments
const [taskType, taskPayloadAsString] = process.argv.slice(2);
const taskPayload = turnStringToObj(taskPayloadAsString);

// Log the parameters for debugging purposes
console.log("Parameters");
console.log("Task type :", taskType);
console.log("Payload as string :", taskPayloadAsString);
console.log("Payload as object :", taskPayload);

// Standardized signature for all task handlers
type TaskHandler = (db: Database.Database, payload: any) => Promise<void>;

// Explicit execution map (100% type-safe)
const taskMap: Record<TaskType, TaskHandler> = {
    // Games
    ADD_GAME: async (db, payload) => {
        const { addGameToDatabase } = await import('./tasks');
        await addGameToDatabase(db, payload);
    },
    UPDATE_GAME: async (db, payload) => {
        const { updateGameInDatabase } = await import('./tasks');
        await updateGameInDatabase(db, payload);
    },
    DELETE_GAME: async (db, payload) => {
        const { deleteGameFromDatabase } = await import('./tasks');
        await deleteGameFromDatabase(db, payload);
    },

    // Backlog
    ADD_BACKLOG: async (db, payload) => {
        const { addBacklogToDatabase } = await import('./tasks');
        await addBacklogToDatabase(db, payload);
    },
    DELETE_BACKLOG: async (db, payload) => {
        const { deleteBacklogFromDatabase } = await import('./tasks');
        await deleteBacklogFromDatabase(db, payload);
    },
    CLEAN_BACKLOG: async (db) => {
        const { cleanBacklog } = await import('./tasks');
        await cleanBacklog(db);
    },

    // Series
    ADD_SERIE: async (db, payload) => {
        const { addSerieToDatabase } = await import('./tasks');
        await addSerieToDatabase(db, payload);
    },
    MANAGE_SERIE: async (db, payload) => {
        const { manageSerieInDatabase } = await import('./tasks');
        await manageSerieInDatabase(db, payload);
    },

    // DLCs
    MANAGE_DLCS: async (db, payload) => {
        const { manageDlcsInDatabase } = await import('./tasks');
        await manageDlcsInDatabase(db, payload);
    },

    // Tests
    ADD_TEST: async (db, payload) => {
        const { addTestToDatabase } = await import('./tasks');
        await addTestToDatabase(db, payload);
    },
    UPDATE_TEST: async (db, payload) => {
        const { updateTestInDatabase } = await import('./tasks');
        await updateTestInDatabase(db, payload);
    },
    DELETE_TEST: async (db, payload) => {
        const { deleteTestFromDatabase } = await import('./tasks');
        await deleteTestFromDatabase(db, payload);
    },

    // Tier Lists
    UPDATE_TIER_LIST: async (db, payload) => {
        const { updateTierLists } = await import('./tasks');
        await updateTierLists(db, payload);
    },

    // Copy Covers
    COPY_COVERS: async (db, payload) => {
        const { copyCovers } = await import('./tasks');
        await copyCovers(db, payload);
    },
};

// Execute task
const handler = taskMap[taskType as TaskType];

if (handler) {
    await handler(db, taskPayload);
} else {
    console.log(`Bip bip - Unknown or unhandled task: "${taskType}"`);
}
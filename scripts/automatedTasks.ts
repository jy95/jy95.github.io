import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Functions
import { turnStringToObj } from './tasks/common/utils';
import {
    addGameToDatabase,
    updateGameInDatabase,
    deleteGameFromDatabase,
    manageSerieInDatabase,
    addSerieToDatabase,
    cleanBacklog,
    addBacklogToDatabase,
    deleteBacklogFromDatabase,
    addTestToDatabase,
    updateTestInDatabase,
    deleteTestFromDatabase,
} from "./tasks";

// Types
import type { TaskType } from './tasks/common/types';

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

// Execute the task based on the task type
switch (taskType as TaskType) {
    // Games
    case "ADD_GAME":
        await addGameToDatabase(db, taskPayload);
        break;
    case "UPDATE_GAME":
        await updateGameInDatabase(db, taskPayload);
        break;
    case "DELETE_GAME":
        await deleteGameFromDatabase(db, taskPayload);
        break;

    // Backlog
    case "ADD_BACKLOG":
        await addBacklogToDatabase(db, taskPayload);
        break;
    case "DELETE_BACKLOG":
        await deleteBacklogFromDatabase(db, taskPayload);
        break;
    case "CLEAN_BACKLOG":
        await cleanBacklog(db);
        break;

    // Series
    case "ADD_SERIE":
        await addSerieToDatabase(db, taskPayload);
        break;
    case "MANAGE_SERIE":
        await manageSerieInDatabase(db, taskPayload);
        break;

    // DLCs
    case "MANAGE_DLCS":
        await manageSerieInDatabase(db, taskPayload);
        break;

    // Tests
    case "ADD_TEST":
        await addTestToDatabase(db, taskPayload);
        break;
    case "UPDATE_TEST":
        await updateTestInDatabase(db, taskPayload);
        break;
    case "DELETE_TEST":
        await deleteTestFromDatabase(db, taskPayload);
        break;

    default:
        console.log(`Bip bip - Nothing was done as unexpected task`)
}
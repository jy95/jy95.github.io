import Database from 'better-sqlite3';

const databasePath = 'GamesPassionFR.db';
const db = new Database(databasePath, { verbose: console.log });

// Constantes
const PLATFORMS_MAP = {
    'PC': 1,
    'GBA': 2,
    'PSP': 3,
    'PS1': 4,
    'PS2': 5,
    'PS3': 6
}
const GENRES_MAP = {
    'Action': 1,
    'Adventure': 2,
    'Arcade': 3,
    'Board Games': 4,
    'Card': 5,
    'Casual': 6,
    'Educational': 7,
    'Family': 8,
    'Fighting': 9,
    'Indie': 10,
    'MMORPG': 11,
    'Platformer': 12,
    'Puzzle': 13,
    'RPG': 14,
    'Racing': 15,
    'Shooter': 16,
    'Simulation': 17,
    'Sports': 18,
    'Strategy': 19,
    'Misc': 20
};
// For the json parse reviver
// Library to parse forms answers considers them as multiple whereas it isn't
const keysToTransform = ["identifierKind", "platform"];

// Parse positional arguments
const [taskType, taskPayloadAsString] = process.argv.slice(2);
console.log("Parameters");
console.log("Task type :", taskType);
console.log("Payload as string :", taskPayloadAsString);
const taskPayload = JSON.parse(taskPayloadAsString, (key, value) => {
    // Determine if the key is in the transform list
    const isKeyToTransform = keysToTransform.includes(key);

    // Check if the value is an array and if it should be transformed
    const shouldTransform = isKeyToTransform && Array.isArray(value);

    // Return undefined for empty arrays, the first element for single-element arrays, and the original value otherwise
    if (shouldTransform) {
        if (value.length === 0) {
            return undefined;
        } else if (value.length === 1) {
            return value[0];
        }
    }

    // Return the original value if no transformation is needed
    return value;
  });

/**
 * @typedef {'Playlist' | 'Video'} IdentifierKind
 * 
 * @enum {IdentifierKind}
 * @property {'Playlist'} Playlist - Represents Playlist
 * @property {'Video'} Video - Represents Video
 */

/**
 * @typedef {('PC' | 'GBA' | 'PSP' | 'PS1' | 'PS2' | 'PS3')} Platform
 * @description Represents different gaming platforms. 
 * Note: In the database, you must map these values to numbers for storage.
 * 
 * @enum {Platform}
 * @property {'PC'} PC - PC
 * @property {'GBA'} GBA - Game Boy Advance
 * @property {'PSP'} PSP - PlayStation Portable
 * @property {'PS1'} PS1 - PlayStation 1
 * @property {'PS2'} PS2 - PlayStation 2
 * @property {'PS3'} PS3 - PlayStation 3
 */

/**
 * @typedef {('Action' | 'Adventure' | 'Arcade' | 'Board Games' | 'Card' | 'Casual' | 'Educational' | 'Family' | 'Fighting' | 'Indie' | 'MMORPG' | 'Platformer' | 'Puzzle' | 'RPG' | 'Racing' | 'Shooter' | 'Simulation' | 'Sports' | 'Strategy' | 'Misc')} GameGenre
 * @description Represents different game genres. 
 * Note: In the database, you must map these values to numbers for storage.
 * 
 * @enum {GameGenre}
 * @property {'Action'} Action - Action genre
 * @property {'Adventure'} Adventure - Adventure genre
 * @property {'Arcade'} Arcade - Arcade genre
 * @property {'Board Games'} Board Games - Board Games genre
 * @property {'Card'} Card - Card genre
 * @property {'Casual'} Casual - Casual genre
 * @property {'Educational'} Educational - Educational genre
 * @property {'Family'} Family - Family genre
 * @property {'Fighting'} Fighting - Fighting genre
 * @property {'Indie'} Indie - Indie genre
 * @property {'MMORPG'} MMORPG - MMORPG genre
 * @property {'Platformer'} Platformer - Platformer genre
 * @property {'Puzzle'} Puzzle - Puzzle genre
 * @property {'RPG'} RPG - RPG genre
 * @property {'Racing'} Racing - Racing genre
 * @property {'Shooter'} Shooter - Shooter genre
 * @property {'Simulation'} Simulation - Simulation genre
 * @property {'Sports'} Sports - Sports genre
 * @property {'Strategy'} Strategy - Strategy genre
 * @property {'Misc'} Misc - Miscellaneous genre
 */

/**
 * Turn the response platform to database ID
 * @param {Platform} platform 
 */
function platformToInt(platform) {
    return PLATFORMS_MAP[platform] || 0;
}

/**
 * Turn the response genre to database ID
 * @param {GameGenre} genre 
 * @returns 
 */
function genreToInt(genre) {
    return GENRES_MAP[genre] || 0;
}

/**
 * Turn the response kind to database field
 * @param {IdentifierKind} identifierKind
 * @returns
 */
function identifierKindToDatabaseField(identifierKind) {
    return identifierKind.includes("Video") ? "videoId" : "playlistId";
}

/**
 * Add game into the database
 * @param {import('better-sqlite3').Database} db - The database instance
 * @param {Object} payload - The game details
 * @param {string} payload.title - The title of the game
 * @param {string} payload.releaseDate - The release date of the game (YYYY-MM-DD)
 * @param {IdentifierKind} payload.identifierKind - The identifier kind (Playlist, Video)
 * @param {string} payload.identifierValue - The identifier value (ex. PLRfhDHeBTBJ56jE5Kb3Wb6vBZZKLgM0dR or dn6QTMujBiY)
 * @param {Platform} payload.platform - The game platform (PC, ...)
 * @param {GameGenre[]} [payload.genres] - The game genres (Action, Adventure, ...)
 * @param {string} [payload.duration] - The game duration (HH:MM:SS)
 * @param {string} [payload.availableAt] - The game start date on the channel (YYYY-MM-DD)
 * @param {string} [payload.endAt] - The game end date on the channel (YYYY-MM-DD)
 * 
 */
async function addGameToDatabase(db, payload) {
    
    // Prepare fields

    const keyField = identifierKindToDatabaseField(payload.identifierKind);
    const gameToInsert = {
        identifier: payload.identifierValue,
        title: payload.title,
        releaseDate: payload.releaseDate,
        duration: payload.duration || "00:00:00",
        platform: platformToInt(payload.platform)
    }

    const genres = (payload.genres || []).map(genreToInt);

    const period = (payload.availableAt) ? {
        availableAt: payload.availableAt,
        endAt: payload.endAt || null
    } : undefined;

    // Statements
    const insertGameStmt = db.prepare(`INSERT INTO games (${keyField}, title, releaseDate, duration, platform) VALUES (@identifier, @title, @releaseDate, @duration, @platform)`);
    const findInsertedId = db.prepare('SELECT MAX(id) from games where title = ?');
    const insertGenresWithGameStmt = db.prepare("INSERT INTO games_genres (game, genre) VALUES (?, ?)");
    const insertAvailabilityStmt = db.prepare("INSERT INTO games_schedules (id, availableAt, endAt) VALUES (?, ?, ?) ")

    // Execution time
    const insertOneGame = db.transaction(() => {
        // Insert basic information about game
        insertGameStmt.run(gameToInsert);
        // retrieve it id in database
        const gameId = findInsertedId.pluck().get(payload.title);
        // insert genre(s)
        for(const genreId of genres) {
            insertGenresWithGameStmt.run(gameId, genreId);
        }
        // If period isn't null, we have an extra row to add in database
        if (period) {
            insertAvailabilityStmt.run(gameId, period.availableAt, period.endAt);
        }
    });

    return insertOneGame();
}

/**
 * Update game fields
 * @param {import('better-sqlite3').Database} db - The database instance
 * @param {Object} payload - The game details
 * @param {string} [payload.title] - The title of the game
 * @param {string} [payload.releaseDate] - The release date of the game (YYYY-MM-DD)
 * @param {IdentifierKind} payload.identifierKind - The identifier kind (Playlist, Video)
 * @param {string} payload.identifierValue - The identifier value (ex. PLRfhDHeBTBJ56jE5Kb3Wb6vBZZKLgM0dR or dn6QTMujBiY)
 * @param {Platform} [payload.platform] - The game platform (PC, ...)
 * @param {GameGenre[]} [payload.genres] - The game genres (Action, Adventure, ...)
 * @param {string} [payload.duration] - The game duration (HH:MM:SS)
 * @param {string} [payload.availableAt] - The game start date on the channel (YYYY-MM-DD)
 * @param {string} [payload.endAt] - The game end date on the channel (YYYY-MM-DD)
 * 
 */
async function updateGameInDatabase(db, payload) {
    const keyField = identifierKindToDatabaseField(payload.identifierKind);
    const youtubeIdentifier = payload.identifierValue;
    const genres = (payload.genres || []).map(genreToInt);
    
    // Statments
    const findGameIdStmt = db.prepare(`SELECT id from games WHERE ${keyField} = ?`);
    const updateTitleStmt = db.prepare("UPDATE games SET title = ? WHERE id = ?");
    const updateReleaseDateStmt = db.prepare("UPDATE games SET releaseDate = ? WHERE id = ?");
    const updatePlatformStmt = db.prepare("UPDATE games SET platform = ? WHERE id = ?");
    const updateDurationStmt = db.prepare("UPDATE games SET duration = ? WHERE id = ?");
    const hasScheduleStmt = db.prepare("SELECT 1 FROM games_schedules WHERE id = ?");
    const insertScheduleStmt = db.prepare("INSERT INTO games_schedules (id) VALUES (?) ");
    const updateAvailableAtStmt = db.prepare("UPDATE games_schedules SET availableAt = ? WHERE id = ?");
    const updateEndAtStmt = db.prepare("UPDATE games_schedules SET endAt = ? WHERE id = ?");
    const deleteGenreStmt = db.prepare("DELETE FROM games_genres WHERE game = ?");
    const insertGenresWithGameStmt = db.prepare("INSERT INTO games_genres (game, genre) VALUES (?, ?)");

    /**
     * Check if the given key is a valid key in the payload object and its value is not an empty string.
     * 
     * @param {keyof typeof payload} key - The key to check in the payload.
     * @returns {boolean} - Returns `true` if the value of the key in the payload is defined and non-empty, otherwise `false`.
     */
    const notEmptyString = (key) => payload[key] !== undefined && payload[key].length > 0;

    // has attributes
    const hasTitle = notEmptyString("title");
    const hasReleaseDate = notEmptyString("releaseDate");
    const hasDuration = notEmptyString("duration");
    const hasAvailableAt = notEmptyString("availableAt");
    const hasEndAt = notEmptyString("endAt");
    const hasScheduleData = hasAvailableAt || hasEndAt;

    // Execution time
    const updateGame = db.transaction(() => {
        // Find game id
        const gameId = findGameIdStmt.pluck().get(youtubeIdentifier);
        // has schedule ?
        const hasScheduleRow = hasScheduleStmt.pluck().get(gameId) !== undefined;

        // Update title
        if (hasTitle) {
            updateTitleStmt.run(payload.title, gameId);
        }

        // Update release date
        if (hasReleaseDate) {
            updateReleaseDateStmt.run(payload.releaseDate.trim(), gameId);
        }

        // Update platform
        if (payload.platform !== undefined) {
            const platform = platformToInt(payload.platform);
            updatePlatformStmt.run(platform, gameId);
        }

        // Update duration
        if (hasDuration) {
            updateDurationStmt.run(payload.duration, gameId);
        }

        // Create a row of game schedules, if not existing already
        if (hasScheduleData && !hasScheduleRow) {
            insertScheduleStmt.run(gameId);
        }

        // Update available at
        if (hasAvailableAt) {
            updateAvailableAtStmt.run(payload.availableAt.trim(), gameId);
        }

        // Update end at
        if (hasEndAt) {
            updateEndAtStmt.run(payload.endAt.trim(), gameId);
        }

        // update genres
        if (genres.length > 0) {
            // Delete existing genres
            deleteGenreStmt.run(gameId);

            // Insert each new genre
            for(const genre of genres) {
                insertGenresWithGameStmt.run(gameId, genre);
            }
        }
    });

    return updateGame();
}

/**
 * Delete game from database
 * @param {import('better-sqlite3').Database} db - The database instance
 * @param {Object} payload - The game details
 * @param {IdentifierKind} payload.identifierKind - The identifier kind (Playlist, Video)
 * @param {string} payload.identifierValue - The identifier value (ex. PLRfhDHeBTBJ56jE5Kb3Wb6vBZZKLgM0dR or dn6QTMujBiY)
 * 
 */
async function deleteGameFromDatabase(db, payload) {
    // Fields
    const keyField = identifierKindToDatabaseField(payload.identifierKind);
    const youtubeIdentifier = payload.identifierValue;

    // Statments
    const findGameIdStmt = db.prepare(`SELECT id from games WHERE ${keyField} = ?`);
    const deleteGameStmt = db.prepare("DELETE FROM games WHERE id = ?");

    // Find game id
    const gameId = findGameIdStmt.pluck().get(youtubeIdentifier);
    // Delete game and everything related, thanks to the CASCADE DELETE
    return deleteGameStmt.run(gameId);
}

/**
 * Add a backlog entry into database
 * @param {import('better-sqlite3').Database} db - The database instance
 * @param {Object} payload - The game details
 * @param {string} payload.title - The title of the game
 * @param {Platform} [payload.platform] - The platform of the game
 * @param {string} [payload.notes] - Additional notes about this game
 * 
 */
async function addBacklogToDatabase(db, payload) {
    // fields
    const backlogToInsert = {
        title: payload.title,
        platform: (payload.platform !== undefined) ? platformToInt(payload.platform) : null,
        notes: (payload.notes) ? payload.notes : null
    }

    // statments
    const insertStmt = db.prepare("INSERT INTO backlog (title, platform, notes) VALUES (@title, @platform, @notes)");

    // Execution time
    return insertStmt.run(backlogToInsert);
}

/**
 * Delete a backlog entry from database
 * @param {import('better-sqlite3').Database} db - The database instance
 * @param {Object} payload - The game details
 * @param {string} payload.title - The title of the game
 * 
 */
async function deleteBacklogFromDatabase(db, payload) {
    const deleteBacklogStmt = db.prepare("DELETE FROM backlog WHERE title = ?");
    return deleteBacklogStmt.run(payload.title);
}

/**
 * Add a serie into database
 * @param {import('better-sqlite3').Database} db - The database instance
 * @param {Object} payload - The details
 * @param {string} payload.title - The title of the serie
 * 
 */
async function addSerieToDatabase(db, payload) {
    // fields
    const serieToInsert = {
        name: payload.title
    }

    // statments
    const insertStmt = db.prepare("INSERT INTO series (name) VALUES (@name)");

    // Execution time
    return insertStmt.run(serieToInsert);
}

/**
 * Manage a serie in database
 * @param {import('better-sqlite3').Database} db - The database instance
 * @param {Object} payload - The details
 * @param {string} payload.title - The title of the serie
 * @param {string} payload.games_textarea - The games of this serie (as textarea)
 * 
 */
async function manageSerieInDatabase(db, payload) {

    // Fetch games ID
    const games = payload.games_textarea
        .split("\n")
        .map(s => s.trim())
        .filter(s => s.length > 0);

    // Statements
    const findSerieIdStmt = db.prepare('SELECT id FROM series WHERE name = ?');
    const deleteSeriesGamesStmt = db.prepare('DELETE FROM series_games WHERE serie = ?');
    const fetchGameByIdStmt = db.prepare('SELECT id FROM games WHERE videoId = @id OR playlistId = @id');
    const insertGameToSerieStmt = db.prepare('INSERT INTO series_games (serie, game, `order`) VALUES (?, ?, ?)');

    // Execution time
    const serieId = findSerieIdStmt.pluck().get(payload.title);
    await deleteSeriesGamesStmt.run(serieId);

    const updateSerieItems = db.transaction(() => {

        let idx = 1;
        for(const gameIdentifier of games) {

            // Fetch game id
            const gameId = fetchGameByIdStmt.pluck().get({ id: gameIdentifier });

            // Insert the game's order in the series
            insertGameToSerieStmt.run(serieId, gameId, idx);

            // Next iteration
            idx++;
        }

    });

    return updateSerieItems();
}

/**
 * Manage dlcs in database
 * @param {import('better-sqlite3').Database} db - The database instance
 * @param {Object} payload - The details
 * @param {string} payload.gameID - The ID of the game (videoId or playlistId)
 * @param {string} payload.dlcs_textarea - The dlc of this game (as textarea)
 * 
 */
async function manageDlcsInDatabase(db, payload) {

    // Fetch games ID
    const dlcs = payload.dlcs_textarea
        .split("\n")
        .map(s => s.trim())
        .filter(s => s.length > 0);

    // Statements
    const fetchGameByIdStmt = db.prepare('SELECT id FROM games WHERE videoId = @id OR playlistId = @id');
    const deleteGameDLCsStmt = db.prepare('DELETE FROM games_dlcs WHERE game = ?');
    const insertDLCToGameStmt = db.prepare('INSERT INTO games_dlcs (game, dlc, `order`) VALUES (?, ?, ?)');

    // Execution time
    const gameID = fetchGameByIdStmt.pluck().get({ id: payload.gameID });
    await deleteGameDLCsStmt.run(gameID);

    const updateDLCSItems = db.transaction(() => {

        let idx = 1;
        for(const gameIdentifier of dlcs) {

            // Fetch game id
            const dlcID = fetchGameByIdStmt.pluck().get({ id: gameIdentifier });

            // Insert the dlc's order in the game
            insertDLCToGameStmt.run(gameID, dlcID, idx);

            // Next iteration
            idx++;
        }

    });

    return updateDLCSItems();
}

/**
 * Clear completed games from backlog 
 * @param {import('better-sqlite3').Database} db - The database instance
 * 
 */
async function cleanBacklog(db) {
    const deleteBacklogStmt = db.prepare("DELETE FROM backlog WHERE title IN (SELECT title FROM games)");
    return deleteBacklogStmt.run();
}

/**
 * Add a test into the database
 * @param {import('better-sqlite3').Database} db - The database instance
 * @param {Object} payload - The test details
 * @param {string} payload.title - The title of the test
 * @param {string} [payload.releaseDate] - The release date of the test (YYYY-MM-DD)
 * @param {IdentifierKind} payload.identifierKind - The identifier kind (Playlist, Video)
 * @param {string} payload.identifierValue - The identifier value (ex. PLRfhDHeBTBJ56jE5Kb3Wb6vBZZKLgM0dR or dn6QTMujBiY)
 * @param {Platform} payload.platform - The test platform (PC, ...)
 * @param {string} [payload.duration] - The test duration (HH:MM:SS)
 */
async function addTestToDatabase(db, payload) {
    // Prepare fields

    const keyField = identifierKindToDatabaseField(payload.identifierKind);

    const today = new Date();
    const formattedToday = today.toISOString().slice(0, 10);

    const testToInsert = {
        identifier: payload.identifierValue,
        title: payload.title,
        releaseDate: payload.releaseDate || formattedToday,
        duration: payload.duration || "00:00:00",
        platform: platformToInt(payload.platform)
    }

    // Statement
    const insertStmt = db.prepare(`INSERT INTO tests (${keyField}, title, releaseDate, duration, platform) VALUES (@identifier, @title, @releaseDate, @duration, @platform)`);
    return insertStmt.run(testToInsert);
}

/**
 * Update test fields
 * @param {import('better-sqlite3').Database} db - The database instance
 * @param {Object} payload - The test details
 * @param {string} [payload.title] - The title of the test
 * @param {string} [payload.releaseDate] - The release date of the test (YYYY-MM-DD)
 * @param {IdentifierKind} payload.identifierKind - The identifier kind (Playlist, Video)
 * @param {string} payload.identifierValue - The identifier value (ex. PLRfhDHeBTBJ56jE5Kb3Wb6vBZZKLgM0dR or dn6QTMujBiY)
 * @param {Platform} [payload.platform] - The test platform (PC, ...)
 * @param {string} [payload.duration] - The game duration (HH:MM:SS)
 * 
 */
async function updateTestInDatabase(db, payload) {
    const keyField = identifierKindToDatabaseField(payload.identifierKind);
    const youtubeIdentifier = payload.identifierValue;
    
    // Statments
    const findGameIdStmt = db.prepare(`SELECT id from tests WHERE ${keyField} = ?`);
    const updateTitleStmt = db.prepare("UPDATE tests SET title = ? WHERE id = ?");
    const updateReleaseDateStmt = db.prepare("UPDATE tests SET releaseDate = ? WHERE id = ?");
    const updatePlatformStmt = db.prepare("UPDATE tests SET platform = ? WHERE id = ?");
    const updateDurationStmt = db.prepare("UPDATE tests SET duration = ? WHERE id = ?");

    /**
     * Check if the given key is a valid key in the payload object and its value is not an empty string.
     * 
     * @param {keyof typeof payload} key - The key to check in the payload.
     * @returns {boolean} - Returns `true` if the value of the key in the payload is defined and non-empty, otherwise `false`.
     */
    const notEmptyString = (key) => payload[key] !== undefined && payload[key].length > 0;

    // has attributes
    const hasTitle = notEmptyString("title");
    const hasReleaseDate = notEmptyString("releaseDate");
    const hasDuration = notEmptyString("duration");

    // Execution time
    const updateGame = db.transaction(() => {
        // Find game id
        const gameId = findGameIdStmt.pluck().get(youtubeIdentifier);

        // Update title
        if (hasTitle) {
            updateTitleStmt.run(payload.title, gameId);
        }

        // Update release date
        if (hasReleaseDate) {
            updateReleaseDateStmt.run(payload.releaseDate.trim(), gameId);
        }

        // Update platform
        if (payload.platform !== undefined) {
            const platform = platformToInt(payload.platform);
            updatePlatformStmt.run(platform, gameId);
        }

        // Update duration
        if (hasDuration) {
            updateDurationStmt.run(payload.duration, gameId);
        }

    });

    return updateGame();
}

/**
 * Remove a test from the database
 * @param {import('better-sqlite3').Database} db - The database instance
 * @param {Object} payload - The test details
 * @param {IdentifierKind} payload.identifierKind - The identifier kind (Playlist, Video)
 * @param {string} payload.identifierValue - The identifier value (ex. PLRfhDHeBTBJ56jE5Kb3Wb6vBZZKLgM0dR or dn6QTMujBiY)
 */
async function deleteTestFromDatabase(db, payload) {
    // Fields
    const keyField = identifierKindToDatabaseField(payload.identifierKind);
    const youtubeIdentifier = payload.identifierValue;

    // Statments
    const findGameIdStmt = db.prepare(`SELECT id from tests WHERE ${keyField} = ?`);
    const deleteTestStmt = db.prepare("DELETE FROM tests WHERE id = ?");

    // Find game id
    const gameId = findGameIdStmt.pluck().get(youtubeIdentifier);
    // Delete game and everything related, thanks to the CASCADE DELETE
    return deleteTestStmt.run(gameId);
}

switch(taskType) {
    case "ADD_GAME":
        await addGameToDatabase(db, taskPayload);
        break;
    case "UPDATE_GAME":
        await updateGameInDatabase(db, taskPayload);
        break;
    case "DELETE_GAME":
        await deleteGameFromDatabase(db, taskPayload);
        break;
    case "ADD_BACKLOG":
        await addBacklogToDatabase(db, taskPayload);
        break;
    case "DELETE_BACKLOG":
        await deleteBacklogFromDatabase(db, taskPayload);
        break;
    case "ADD_SERIE":
        await addSerieToDatabase(db, taskPayload);
        break;
    case "MANAGE_SERIE":
        await manageSerieInDatabase(db, taskPayload);
        break;
    case "MANAGE_DLCS":
        await manageDlcsInDatabase(db, taskPayload);
        break;
    case "CLEAN_BACKLOG":
        await cleanBacklog(db);
        break;
    case "ADD_TEST":
        await addTestToDatabase(db, taskPayload);
        break;
    case "DELETE_TEST":
        await deleteTestFromDatabase(db, taskPayload);
        break;
    case "UPDATE_TEST":
        await updateTestInDatabase(db, taskPayload);
        break;
    default:
        console.log(`Bip bip - Nothing was done as unexpected task`)
}

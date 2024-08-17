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
    const updateAvailableAtStmt = db.prepare("UPDATE games_schedules SET availableAt = ? WHERE id = ?");
    const updateEndAtStmt = db.prepare("UPDATE games_schedules SET endAt = ? WHERE id = ?");
    const deleteGenreStmt = db.prepare("DELETE FROM games_genres WHERE game = ?");
    const insertGenresWithGameStmt = db.prepare("INSERT INTO games_genres (game, genre) VALUES (?, ?)");

    // Execution time
    const updateGame = db.transaction(() => {
        // Find game id
        const gameId = findGameIdStmt.pluck().get(youtubeIdentifier);

        // Update title
        if (payload.title !== undefined) {
            updateTitleStmt.run(payload.title, gameId);
        }

        // Update release date
        if (payload.releaseDate !== undefined) {
            updateReleaseDateStmt.run(payload.releaseDate, gameId);
        }

        // Update platform
        if (payload.platform !== undefined) {
            const platform = platformToInt(payload.platform);
            updatePlatformStmt.run(platform, gameId);
        }

        // Update duration
        if (payload.duration !== undefined) {
            updateDurationStmt.run(payload.duration, gameId);
        }

        // Update available at
        if (payload.availableAt !== undefined) {
            updateAvailableAtStmt.run(payload.availableAt, gameId);
        }

        // Update end at
        if (payload.endAt !== undefined) {
            updateEndAtStmt.run(payload.endAt, gameId);
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
 * Update game fields
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
    deleteGameStmt.run(gameId);
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
    insertStmt.run(backlogToInsert);
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
    deleteBacklogStmt.run(payload.title);
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
    default:
        console.log(`Bip bip - Nothing was done as unexpected task`)
}
import Database from 'better-sqlite3';

const databasePath = 'GamesPassionFR.db';
const db = new Database(databasePath);

// Parse positional arguments
const [taskType, taskPayloadAsString] = process.argv.slice(2);
const taskPayload = JSON.parse(taskPayloadAsString);

/**
 * @typedef {0 | 1} IdentifierKind
 * 
 * @enum {IdentifierKind}
 * @property {number} 0 - Playlist
 * @property {number} 1 - Video
 */

/**
 * @typedef {0 | 1 | 2 | 3 | 4 | 5} Platform
 * @description Beware that in database, you must do a +1 to this value !!!
 * 
 * @enum {Platform}
 * @property {number} 0 - PC
 * @property {number} 1 - GBA
 * @property {number} 2 - PSP
 * @property {number} 3 - PS1
 * @property {number} 4 - PS2
 * @property {number} 5 - PS3
 */

/**
 * @typedef {0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19} GameGenre
 * @description Beware that in database, you must do a +1 to this value !!!
 * 
 * @enum {GameGenre}
 * @property {number} 0 - Action
 * @property {number} 1 - Adventure
 * @property {number} 2 - Arcade
 * @property {number} 3 - Board Games
 * @property {number} 4 - Card
 * @property {number} 5 - Casual
 * @property {number} 6 - Educational
 * @property {number} 7 - Family
 * @property {number} 8 - Fighting
 * @property {number} 9 - Indie
 * @property {number} 10 - MMORPG
 * @property {number} 11 - Platformer
 * @property {number} 12 - Puzzle
 * @property {number} 13 - RPG
 * @property {number} 14 - Racing
 * @property {number} 15 - Shooter
 * @property {number} 16 - Simulation
 * @property {number} 17 - Sports
 * @property {number} 18 - Strategy
 * @property {number} 19 - Misc
 */

/**
 * Turn the response platform to database ID
 * @param {Platform} platform 
 */
function platformToInt(platform) {
    return platform + 1;
}

/**
 * Turn the response genre to database ID
 * @param {GameGenre} genre 
 * @returns 
 */
function genreToInt(genre) {
    return genre + 1;
}

/**
 * Add game into the database
 * @param {import('better-sqlite3').Database} db - The database instance
 * @param {Object} payload - The game details
 * @param {string} payload.title - The title of the game
 * @param {string} payload.releaseDate - The release date of the game (YYYY-MM-DD)
 * @param {IdentifierKind} payload.identifierKind - The identifier kind (0 for Playlist, 1 for Video)
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

    const keyField = payload.identifierKind === 1 ? "videoId" : "playlistId";
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
    const insertAvailabilityStmt = db.prepare("INSERT INTO games_schedules (id, availableAt, endAt) VALUES (?, ?) ")

    // Execution time
    db.transaction(() => {
        // Insert basic information about game
        insertGameStmt.run(gameToInsert);
        // retrieve it id in database
        const gameId = findInsertedId.pluck().get(payload.title);
        // insert genre(s)
        for(const genreId in genres) {
            insertGenresWithGameStmt.run(gameId, genreId);
        }
        // If period isn't null, we have an extra row to add in database
        if (period) {
            insertAvailabilityStmt.run(gameId, period.availableAt, period.endAt);
        }
    });
}

/**
 * Add game into the database
 * @param {import('better-sqlite3').Database} db - The database instance
 * @param {Object} payload - The game details
 * @param {string} [payload.title] - The title of the game
 * @param {string} [payload.releaseDate] - The release date of the game (YYYY-MM-DD)
 * @param {IdentifierKind} payload.identifierKind - The identifier kind (0 for Playlist, 1 for Video)
 * @param {string} payload.identifierValue - The identifier value (ex. PLRfhDHeBTBJ56jE5Kb3Wb6vBZZKLgM0dR or dn6QTMujBiY)
 * @param {Platform} [payload.platform] - The game platform (PC, ...)
 * @param {GameGenre[]} [payload.genres] - The game genres (Action, Adventure, ...)
 * @param {string} [payload.duration] - The game duration (HH:MM:SS)
 * @param {string} [payload.availableAt] - The game start date on the channel (YYYY-MM-DD)
 * @param {string} [payload.endAt] - The game end date on the channel (YYYY-MM-DD)
 * 
 */
async function updateGameInDatabase(db, payload) {
    const keyField = payload.identifierKind === 1 ? "videoId" : "playlistId";
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
    db.transaction(() => {
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
}

switch(taskType) {
    case "ADD_GAME":
        await addGameToDatabase(db, taskPayload);
        break;
    case "UPDATE_GAME":
        await updateGameInDatabase(db, taskPayload);
        break;
    case "DELETE_GAME":
        break;
    case "ADD_BACKLOG":
        break;
    case "DELETE_BACKLOG":
        break;
    default:
        console.log(`Bip bip - unknwon task : ${taskType}`)
}
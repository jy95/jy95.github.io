import { writeFile } from "fs/promises";
import Database from 'better-sqlite3';

// Params
const databasePath = 'GamesPassionFR.db';
const FILES = {
    "BACKLOG": "src/app/api/backlog/backlog.json",
    "GAMES": "src/app/api/games/games.json",
    "SERIES": "src/app/api/series/series.json",
    "TESTS": "src/app/api/tests/tests.json",
    "PLATFORMS": "src/app/api/platforms/platforms.json",
    "GENRES": "src/app/api/genres/genres.json",
    "PLANNING": "src/app/api/planning/planning.json",
    "STATS": "src/app/api/stats/stats.json",
    "PAST_GAMES": "src/app/api/planning/past-planning.json",
}

const db = new Database(databasePath, {
    readonly: true
});

//db.pragma('journal_mode = WAL');

// Helper Functions
function stringifyJSON(payload) {

    function parseIfJsonString(value) {
        if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
            try {
                return JSON.parse(value);
            } catch (e) {
                return value;
            }
        }
        return value;
    }

    return JSON.stringify(payload, function(key, value) {
        if (value === null) {
            // Exclude null values
            return undefined;
        }
        return parseIfJsonString(value);
    }, "\t");
}
function normaliazeDuration(duration) {

    // Turn it into seconds
    let totalInSeconds = [
        duration.hours * 3600,
        duration.minutes * 60,
        duration.seconds
    ].reduce( (acc, total) => acc + total, 0);

    // Time to normalize the result
    let new_hours = Math.floor(totalInSeconds / 3600);
    totalInSeconds %= 3600;
    let new_minutes = Math.floor(totalInSeconds / 60);
    let new_seconds = totalInSeconds % 60;

    return {
        hours: new_hours,
        minutes: new_minutes,
        seconds : new_seconds
    }

}


/**
 * Extracts platforms from the database and saves them to a file.
 * @param {import('better-sqlite3').Database} db - The database instance
 */
async function extractAndSavePlatforms(db) {
    const extractPlatformsStmt = db.prepare("SELECT id, name FROM platforms");
    const platforms = extractPlatformsStmt.all();
    await writeFile(
        FILES.PLATFORMS,
        stringifyJSON(platforms),
        "utf-8"
    );
    console.log(`${FILES.PLATFORMS} successfully written`);
}

/**
 * Extracts genres from the database and saves them to a file.
 * @param {import('better-sqlite3').Database} db - The database instance
 */
async function extractAndSaveGenres(db) {
    const extractGenresStmt = db.prepare("SELECT id, name FROM genres");
    const genres = extractGenresStmt.all();
    await writeFile(
        FILES.GENRES,
        stringifyJSON(genres),
        "utf-8"
    );
    console.log(`${FILES.GENRES} successfully written`);
}

/**
 * Extracts backlog from the database and saves them to a file.
 * @param {import('better-sqlite3').Database} db - The database instance
 */
async function extractAndSaveBacklog(db) {
    const extractBacklogStmt = db.prepare("SELECT id, title, platform, notes FROM backlog");
    const backlog = extractBacklogStmt.all();
    await writeFile(
        FILES.BACKLOG,
        stringifyJSON(backlog),
        "utf-8"
    );
    console.log(`${FILES.BACKLOG} successfully written`);
}

/**
 * Extracts planning from the database and saves them to a file.
 * @param {import('better-sqlite3').Database} db - The database instance
 */
async function extractAndSavePlanning(db) {
    const extractPlanningStmt = db.prepare("SELECT * FROM games_in_future gif INNER JOIN games g ON g.id == gif.id");
    const planning = extractPlanningStmt.all();
    await writeFile(
        FILES.PLANNING,
        stringifyJSON(planning),
        "utf-8"
    );
    console.log(`${FILES.PLANNING} successfully written`);
}

/**
 * Extracts games from the database and saves them to a file.
 * @param {import('better-sqlite3').Database} db - The database instance
 */
async function extractAndSaveGames(db) {
    const extractGamesList = db.prepare("SELECT * FROM games_in_present");
    const gamesList = extractGamesList.all();
    await writeFile(
        FILES.GAMES,
        stringifyJSON(gamesList),
        "utf-8"
    );
    console.log(`${FILES.GAMES} successfully written`);    
}

/**
 * Extracts series from the database and saves them to a file.
 * @param {import('better-sqlite3').Database} db - The database instance
 */
async function extractAndSaveSeries(db) {
    const extractSeriesStmt = db.prepare("SELECT * FROM series_as_json");
    const series = extractSeriesStmt.all();
    await writeFile(
        FILES.SERIES,
        stringifyJSON(series),
        "utf-8"
    );
    console.log(`${FILES.SERIES} successfully written`);
}

/**
 * Extracts tests from the database and saves them to a file.
 * @param {import('better-sqlite3').Database} db - The database instance
 */
async function extractAndSaveTests(db) {
    const extractTestsStmt = db.prepare("SELECT title, videoId, playlistId, platform FROM tests");
    const tests = extractTestsStmt.all();
    await writeFile(
        FILES.TESTS,
        stringifyJSON(tests),
        "utf-8"
    );
    console.log(`${FILES.TESTS} successfully written`);
}

/**
 * Extracts stats from the database and saves them to a file.
 * @param {import('better-sqlite3').Database} db - The database instance
 */
async function extractAndSaveStats(db) {
    const genresStats = db.prepare("SELECT * FROM genres_stats").all();
    const platformStats = db.prepare("SELECT * FROM platforms_stats").all();
    const games_total_time = db.prepare("SELECT * FROM games_total_time").get();
    const games_total_time_available = db.prepare("SELECT * FROM games_available_time").get();
    const games_total_time_unavailable = db.prepare("SELECT * FROM games_unavailable_time").get();
    const total_games = db.prepare("SELECT COUNT(*) FROM games").pluck().get();
    const total_game_available = db.prepare("SELECT COUNT(*) FROM games_in_present").pluck().get();
    const total_game_unavailable = db.prepare("SELECT COUNT(*) FROM games_in_future").pluck().get();
    
    const result = {
        "platforms": platformStats,
        "genres": genresStats,
        "general": {
            "total": total_games,
            "total_available": total_game_available,
            "total_unavailable": total_game_unavailable,
            "channel_start_date": "2014-04-15T17:35:16+00:00",
            "total_time": normaliazeDuration(games_total_time),
            "total_time_available": normaliazeDuration(games_total_time_available),
            "total_time_unavailable": normaliazeDuration(games_total_time_unavailable)
        }
    }

    await writeFile(
        FILES.STATS,
        stringifyJSON(result),
        "utf-8"
    ); 
    console.log(`${FILES.STATS} successfully written`);
}

/**
 * Extracts games from the database and saves them to a file.
 * @param {import('better-sqlite3').Database} db - The database instance
 */
async function extractAndSavePastGames(db) {
    const extractGamesList = db.prepare("SELECT * FROM games_in_past");
    const gamesList = extractGamesList.all();
    await writeFile(
        FILES.PAST_GAMES,
        stringifyJSON(gamesList),
        "utf-8"
    );
    console.log(`${FILES.PAST_GAMES} successfully written`);    
}

// Operations time
await extractAndSavePlatforms(db)
await extractAndSaveGenres(db)
await extractAndSaveBacklog(db)
await extractAndSavePlanning(db)
await extractAndSaveGames(db)
await extractAndSaveSeries(db)
await extractAndSaveTests(db)
await extractAndSaveStats(db)
await extractAndSavePastGames(db);

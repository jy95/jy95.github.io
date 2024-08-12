import { readFile, writeFile, access } from "fs/promises";
import { resolve as resolvePath } from "path";
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
    "PLANNING": "src/app/api/planning/planning.json"
}

const db = new Database(databasePath, {
    readonly: true
});

db.pragma('journal_mode = WAL');

// Helper Functions
function stringifyJSON(payload) {
    return JSON.stringify(payload, null, "\t")
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

// Extract platforms
const extractPlatformsStmt = db.prepare("SELECT id, name FROM platforms");
const platforms = extractPlatformsStmt.all();
await writeFile(
    FILES.PLATFORMS,
    stringifyJSON(platforms),
    "utf-8"
);

// Extract genres
const extractGenresStmt = db.prepare("SELECT id, name FROM genres");
const genres = extractGenresStmt.all();
await writeFile(
    FILES.GENRES,
    stringifyJSON(genres),
    "utf-8"
);

// Extract backlog
const extractBacklogStmt = db.prepare("SELECT id, title, platform, notes FROM backlog");
const backlog = extractBacklogStmt.all();
await writeFile(
    FILES.BACKLOG,
    stringifyJSON(backlog),
    "utf-8"
);

// Extract planning
const extractPlanningStmt = db.prepare("SELECT * FROM games_in_future gif INNER JOIN games g ON g.id == gif.id");
const planning = extractPlanningStmt.all();
await writeFile(
    FILES.PLANNING,
    stringifyJSON(planning),
    "utf-8"
);

// Extract games
const extractGamesList = db.prepare("SELECT * FROM games_in_present");
const gamesList = extractGamesList.all();
await writeFile(
    FILES.GAMES,
    stringifyJSON(gamesList),
    "utf-8"
);

// Extract series
const extractSeriesStmt = db.prepare("SELECT * FROM series_as_json");
const series = extractSeriesStmt.all();
await writeFile(
    FILES.SERIES,
    stringifyJSON(series),
    "utf-8"
);

// Extract tests
const extractTestsStmt = db.prepare("SELECT title, videoId, playlistId FROM tests");
const tests = extractTestsStmt.all();
await writeFile(
    FILES.TESTS,
    stringifyJSON(tests),
    "utf-8"
);

// Extract stats
const genresStats = db.prepare("SELECT * FROM genres_stats").all();
const platformStats = db.prepare("SELECT * FROM platforms_stats").all();
const games_total_time = db.prepare("SELECT * FROM games_total_time").get();
const games_total_time_available = db.prepare("SELECT * FROM games_available_time").get();
const games_total_time_unavailable = db.prepare("SELECT * FROM games_unavailable_time").get();
const total_games = db.prepare("SELECT COUNT(*) FROM games").get();
const total_game_available = db.prepare("SELECT COUNT(*) FROM games_in_present").get();
const total_game_unavailable = db.prepare("SELECT COUNT(*) FROM games_in_future").get();

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
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

// Extract platforms
const extractPlatformsStmt = db.prepare("SELECT id, name FROM platforms");
const platforms = extractPlatformsStmt.all();
await writeFile(
    FILES.PLATFORMS,
    JSON.stringify(platforms),
    "utf-8"
);

// Extract genres
const extractGenresStmt = db.prepare("SELECT id, name FROM genres");
const genres = extractGenresStmt.all();
await writeFile(
    FILES.GENRES,
    JSON.stringify(genres),
    "utf-8"
);

// Extract backlog
const extractBacklogStmt = db.prepare("SELECT id, title, platform, notes FROM backlog");
const backlog = extractBacklogStmt.all();
await writeFile(
    FILES.BACKLOG,
    JSON.stringify(backlog),
    "utf-8"
);

// Extract planning
const extractPlanningStmt = db.prepare("SELECT * FROM games_in_future gif INNER JOIN games g ON g.id == gif.id");
const planning = extractPlanningStmt.all();
await writeFile(
    FILES.PLANNING,
    JSON.stringify(planning),
    "utf-8"
);

// Extract games
const extractGamesList = db.prepare("SELECT * FROM games_in_present");
const gamesList = extractGamesList.all();
await writeFile(
    FILES.GAMES,
    JSON.stringify(gamesList),
    "utf-8"
);

// Extract series

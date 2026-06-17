import Database from 'better-sqlite3';
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Import extractors
import {
    extractAndSaveBacklog,
    extractAndSaveGames,
    extractAndSaveSeries,
    extractAndSaveTests,
    extractAndSaveStats,
    extractAndSavePlatforms,
    extractAndSaveGenres,
    extractAndSavePlanning,
    extractAndSavePastGames,
    extractAndSaveDLCS,
    extractAndSaveRandomList,
    extractAndSavePastGamesToFeeds,
    extractAndSaveTierListGames,
    extractAndSaveTierListBacklog,
    extractAndSaveTierListCategories,
    extractAndSaveTierListGamesFuture
} from "./extractors"

// Directory of the current script
const __dirname = dirname(fileURLToPath(import.meta.url));

// Params
const databasePath = resolve(__dirname, '..', 'GamesPassionFR.db');
const FILES = {
    "BACKLOG": resolve(__dirname, '..', 'src/app/api/backlog/backlog.json'),
    "GAMES": resolve(__dirname, '..', 'src/app/api/games/games.json'),
    "SERIES": resolve(__dirname, '..', 'src/app/api/series/series.json'),
    "TESTS": resolve(__dirname, '..', 'src/app/api/tests/tests.json'),
    "PLATFORMS": resolve(__dirname, '..', 'src/app/api/platforms/platforms.json'),
    "GENRES": resolve(__dirname, '..', 'src/app/api/genres/genres.json'),
    "PLANNING": resolve(__dirname, '..', 'src/app/api/planning/planning.json'),
    "STATS": resolve(__dirname, '..', 'src/app/api/stats/stats.json'),
    "PAST_GAMES": resolve(__dirname, '..', 'src/app/api/planning/past-planning.json'),
    "DLCS": resolve(__dirname, '..', 'src/app/api/dlcs/dlcs.json'),
    "IDENTIFIERS": resolve(__dirname, '..', 'src/app/api/random/identifiers.json'),
    "RSS": resolve(__dirname, '..', 'public/rss.xml'),
    "JSON_FEED": resolve(__dirname, '..', 'public/feed.json'),
    "TIER_LIST_GAMES": resolve(__dirname, '..', 'src/app/api/tier-lists/games/games.json'),
    "TIER_LIST_BACKLOG": resolve(__dirname, '..', 'src/app/api/tier-lists/backlog/backlog.json'),
    "TIER_LIST_CATEGORIES": resolve(__dirname, '..', 'src/app/api/tier-lists/categories/categories.json'),
    "TIER_LIST_GAMES_FUTURE": resolve(__dirname, '..', 'src/app/api/tier-lists/games/future-games.json'),
}

const db = new Database(databasePath, {
    readonly: true
});

//db.pragma('journal_mode = WAL');

// Operations time
try {
    await extractAndSavePlatforms(db, FILES.PLATFORMS);
    await extractAndSaveGenres(db, FILES.GENRES);
    await extractAndSaveBacklog(db, FILES.BACKLOG);
    await extractAndSavePlanning(db, FILES.PLANNING);
    await extractAndSaveGames(db, FILES.GAMES);
    await extractAndSaveSeries(db, FILES.SERIES);
    await extractAndSaveTests(db, FILES.TESTS);
    await extractAndSaveStats(db, FILES.STATS);
    await extractAndSavePastGames(db, FILES.PAST_GAMES);
    await extractAndSaveDLCS(db, FILES.DLCS);
    await extractAndSaveRandomList(db, FILES.IDENTIFIERS);
    await extractAndSavePastGamesToFeeds(db, FILES.RSS, FILES.JSON_FEED);
    await extractAndSaveTierListGames(db, FILES.TIER_LIST_GAMES);
    await extractAndSaveTierListBacklog(db, FILES.TIER_LIST_BACKLOG);
    await extractAndSaveTierListCategories(db, FILES.TIER_LIST_CATEGORIES);
    await extractAndSaveTierListGamesFuture(db, FILES.TIER_LIST_GAMES_FUTURE);
} finally {
    db.close();
}

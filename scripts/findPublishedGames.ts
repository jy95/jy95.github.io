import { openDatabase } from './common/db';

import type { Database as SQLDatabase } from 'better-sqlite3';

// Set of years to match
const yearsToMatch: Set<string> = new Set(['2026']);

interface GameRow {
    identifier: string;
    title: string;
}

/**
 * Fetches games from the database for all years in the provided set.
 * @param {SQLDatabase} db - The open database connection.
 * @param {Set<string>} years - The set of years to match games.
 * @param {'playlistId' | 'videoId'} identifierColumn - The column to use as the identifier.
 * @returns {GameRow[]} - List of games with their titles and identifiers.
 */
function fetchGamesByIdentifierColumn(
    db: SQLDatabase,
    years: Set<string>,
    identifierColumn: 'playlistId' | 'videoId'
): GameRow[] {
    const stmt = db.prepare(`
        SELECT g.${identifierColumn} AS identifier, g.title
        FROM games_schedules gs
        JOIN games g ON g.id = gs.id
        WHERE strftime('%Y', gs.availableAt) <= ?
          AND (gs.endAt IS NULL OR strftime('%Y', gs.endAt) >= ?)
          AND g.${identifierColumn} IS NOT NULL
    `);

    const seen = new Map<string, GameRow>();
    for (const year of years) {
        for (const game of stmt.all(year, year) as GameRow[]) {
            seen.set(game.identifier, game);
        }
    }
    return [...seen.values()];
}

/**
 * Fetches games with a playlistId from the database for all years in the provided set.
 * @param {SQLDatabase} db - The open database connection.
 * @param {Set<string>} years - The set of years to match games.
 * @returns {GameRow[]} - List of games with their titles and playlistIds as "identifier".
 */
export const fetchGamesWithPlaylists = (db: SQLDatabase, years: Set<string>) =>
    fetchGamesByIdentifierColumn(db, years, 'playlistId');

/**
 * Fetches games with a videoId from the database for all years in the provided set.
 * @param {SQLDatabase} db - The open database connection.
 * @param {Set<string>} years - The set of years to match games.
 * @returns {GameRow[]} - List of games with their titles and videoIds as "identifier".
 */
export const fetchGamesWithVideos = (db: SQLDatabase, years: Set<string>) =>
    fetchGamesByIdentifierColumn(db, years, 'videoId');

/**
 * Prints games with their corresponding IDs in the specified format.
 * * @param {GameRow[]} games - The list of games to print.
 */
function printGamesWithIds(games: GameRow[]): void {
    const output = games.map(game => {
        return `\n\t// ${game.title}\n\t"${game.identifier}"`;
    });
    console.log('[', output.join(',\n'), '\n]');
}

/**
 * Main function to find and print games with matching playlistIds and videoIds.
 * Opens a shared database connection and fetches data using separate functions for all years.
 */
async function findMatchingPlaylistsAndVideos(): Promise<void> {
    // Open the database connection
    const db = openDatabase({ readonly: true });
    
    try {
        console.log(`\nFetching games for all provided years: ${[...yearsToMatch].join(', ')}...\n`);

        // Fetch and print games with playlistId for all years
        const gamesWithPlaylists = fetchGamesWithPlaylists(db, yearsToMatch);
        if (gamesWithPlaylists.length > 0) {
            console.log(`Found ${gamesWithPlaylists.length} game(s) with playlist IDs across all years:`);
            printGamesWithIds(gamesWithPlaylists);
        } else {
            console.log('No games found with playlist IDs.');
        }

        // Fetch and print games with videoId for all years
        const gamesWithVideos = fetchGamesWithVideos(db, yearsToMatch);
        if (gamesWithVideos.length > 0) {
            console.log(`Found ${gamesWithVideos.length} game(s) with video IDs across all years:`);
            printGamesWithIds(gamesWithVideos);
        } else {
            console.log('No games found with video IDs.');
        }
    } finally {
        // Ensure the database connection is closed
        console.log("Closing the database connection.");
        db.close();
    }
}

// Call the main function
await findMatchingPlaylistsAndVideos();
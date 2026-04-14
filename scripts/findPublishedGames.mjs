import Database from 'better-sqlite3';

// Path to the SQLite database file
const dbPath = 'GamesPassionFR.db';

// Set of years to match
const yearsToMatch = new Set(['2023', '2022']);

/**
 * Fetches games with a playlistId from the database for all years in the provided set.
 * 
 * @param {Database} db - The open database connection.
 * @param {Set<string>} years - The set of years to match games.
 * @returns {Array<{ title: string, identifier: string }>} - List of games with their titles and playlistIds as "identifier".
 */
function fetchGamesWithPlaylists(db, years) {
    const stmt = db.prepare(`
        SELECT g.playlistId AS identifier, g.title
        FROM games_schedules gs
        JOIN games g ON g.id = gs.id
        WHERE strftime('%Y', gs.availableAt) <= ? 
          AND (gs.endAt IS NULL OR strftime('%Y', gs.endAt) >= ?)
          AND g.playlistId IS NOT NULL
    `);
    
    let allGamesWithPlaylists = [];
    for (const year of years) {
        const gamesForYear = stmt.all(year, year);
        allGamesWithPlaylists = allGamesWithPlaylists.concat(gamesForYear);
    }
    return allGamesWithPlaylists;
}

/**
 * Fetches games with a videoId from the database for all years in the provided set.
 * 
 * @param {Database} db - The open database connection.
 * @param {Set<string>} years - The set of years to match games.
 * @returns {Array<{ title: string, identifier: string }>} - List of games with their titles and videoIds as "identifier".
 */
function fetchGamesWithVideos(db, years) {
    const stmt = db.prepare(`
        SELECT g.videoId AS identifier, g.title
        FROM games_schedules gs
        JOIN games g ON g.id = gs.id
        WHERE strftime('%Y', gs.availableAt) <= ?
          AND (gs.endAt IS NULL OR strftime('%Y', gs.endAt) >= ?)
          AND g.videoId IS NOT NULL
    `);
    
    let allGamesWithVideos = [];
    for (const year of years) {
        const gamesForYear = stmt.all(year, year);
        allGamesWithVideos = allGamesWithVideos.concat(gamesForYear);
    }
    return allGamesWithVideos;
}

/**
 * Prints games with their corresponding IDs in the specified format.
 * 
 * @param {Array<{ title: string, identifier: string }>} games - The list of games to print.
 */
function printGamesWithIds(games) {
    const output = games.map(game => {
        return `\n\t// ${game.title}\n\t"${game.identifier}"`;
    });
    console.log('[', output.join(',\n'), '\n]');
}

/**
 * Main function to find and print games with matching playlistIds and videoIds.
 * Opens a shared database connection and fetches data using separate functions for all years.
 */
function findMatchingPlaylistsAndVideos() {
    // Open the database connection
    const db = new Database(dbPath, { readonly: true });
    
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
findMatchingPlaylistsAndVideos();
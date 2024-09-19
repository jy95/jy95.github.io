import Database from 'better-sqlite3';

// Path to the SQLite database file
const dbPath = 'GamesPassionFR.db';

// Set of years to match
const yearsToMatch = new Set(['2023']);

function findMatchingPlaylists() {
    try {
        // Open the database connection
        const db = new Database(dbPath, { readonly: true });

        // SQL query with placeholders
        const stmt = db.prepare(`
            SELECT g.playlistId
            FROM games_schedules gs
            JOIN games g ON g.id = gs.id
            WHERE (strftime('%Y', gs.availableAt) = ? OR strftime('%Y', gs.endAt) = ?)
              AND g.playlistId IS NOT NULL
        `);

        // Collect playlist IDs for each year in yearsToMatch
        const matchingPlaylistIds = [];

        // Execute the query for each year
        for (const year of yearsToMatch) {
            const rows = stmt.all(year, year);
            matchingPlaylistIds.push(...rows.map(row => row.playlistId));
        }

        // Output the matching playlist IDs
        console.log(JSON.stringify(matchingPlaylistIds, null, "\t"));

        // Close the database connection
        db.close();
        
    } catch (err) {
        console.error('Error:', err.message); // More specific error message
    }
}

// Call the function
findMatchingPlaylists();
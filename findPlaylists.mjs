import Database from 'better-sqlite3';

// Path to the SQLite database file
const dbPath = 'GamesPassionFR.db';

// Set of years to match
const yearsToMatch = new Set(['2023']);

function findMatchingPlaylists() {
    try {
        // Open the database connection
        const db = new Database(dbPath, { readonly: true });

        // SQL query with placeholders to fetch both playlistId and game title
        const stmt = db.prepare(`
            SELECT g.playlistId, g.title
            FROM games_schedules gs
            JOIN games g ON g.id = gs.id
            WHERE (strftime('%Y', gs.availableAt) = ? OR strftime('%Y', gs.endAt) = ?)
              AND g.playlistId IS NOT NULL
        `);

        // Create an array to store games with their title and playlistId
        const gamesWithPlaylists = [];

        // Execute the query for each year and store results in an array
        for (const year of yearsToMatch) {
            const rows = stmt.all(year, year);
            rows.forEach(row => {
                gamesWithPlaylists.push({
                    title: row.title,
                    playlistId: row.playlistId
                });
            });
        }

        // Now format and print all at once
        const output = gamesWithPlaylists.map(game => {
            return `\n\t// ${game.title}\n\t"${game.playlistId}"`;
        });

        // Output the array in the desired format
        console.log('[', output.join(',\n'), '\n]');
        
        // Close the database connection
        db.close();
        
    } catch (err) {
        console.error('Error:', err.message); // More specific error message
    }
}

// Call the function
findMatchingPlaylists();
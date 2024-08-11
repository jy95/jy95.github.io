import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve the path to the JSON file relative to the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, 'games_to_insert.json');

// Mappings for platform and genre names to their respective IDs
const platformMapping = {
    "PC": 1,
    "GBA": 2,
    "PSP": 3,
    "PS1": 4,
    "PS2": 5,
    "PS3": 6
};

const genreMapping = {
    "Action": 1,
    "Adventure": 2,
    "Arcade": 3,
    "Board Games": 4,
    "Card": 5,
    "Casual": 6,
    "Educational": 7,
    "Family": 8,
    "Fighting": 9,
    "Indie": 10,
    "MMORPG": 11,
    "Platformer": 12,
    "Puzzle": 13,
    "RPG": 14,
    "Racing": 15,
    "Shooter": 16,
    "Simulation": 17,
    "Sports": 18,
    "Strategy": 19,
    "Misc": 20
};

// Helper function to convert releaseDate to SQLite format YYYY-MM-DD
function convertDate(dateStr) {
    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

// Main function to generate and save SQL script
async function generateSqlScript() {
    try {
        // Load the JSON content
        const data = JSON.parse(await readFile(filePath, 'utf-8'));

        // Generating SQL INSERT statements with comments and explanations
        const sqlWithComments = [];

        data.forEach((game, index) => {
            const gameId = index + 1; // Assuming this is the auto-increment ID
            const title = game.title;
            const videoId = game.videoId || null;
            const playlistId = game.playlistId || null;
            const releaseDate = convertDate(game.releaseDate);
            const duration = game.duration || null;
            const platformId = platformMapping[game.platform] || null;

            // Insert into games table with comments
            sqlWithComments.push(
                `-- Insert data for the game '${title}'\n` +
                `INSERT INTO games (id, videoId, playlistId, title, releaseDate, duration, platform) ` +
                `VALUES (${gameId}, "${videoId}", "${playlistId}", "${title}", "${releaseDate}", "${duration}", ${platformId});\n`
            );

            // Insert into games_genres table with comments
            game.genres.forEach((genre) => {
                const genreId = genreMapping[genre] || null;
                if (genreId !== null) {
                    sqlWithComments.push(
                        `-- Associate the game '${title}' with the genre '${genre}'\n` +
                        `INSERT INTO games_genres (game, genre) VALUES (${gameId}, ${genreId});\n`
                    );
                }
            });

            // Insert into games_schedules table with comments (if available)
            const availableAt = game.availableAt;
            const endAt = game.endAt;
            if (availableAt && endAt) {
                sqlWithComments.push(
                    `-- Set the availability for the game '${title}'\n` +
                    `INSERT INTO games_schedules (id, availableAt, endAt) ` +
                    `VALUES (${gameId}, "${availableAt}", "${endAt}");\n`
                );
            }
        });

        // Combine all SQL statements with comments
        const finalSqlScript = sqlWithComments.join('\n');

        // Save the final SQL script to a file
        const outputFilePath = path.join(__dirname, 'games_insert_statements.sql');
        await writeFile(outputFilePath, finalSqlScript, 'utf-8');

        console.log(`SQL script has been saved to ${outputFilePath}`);
    } catch (error) {
        console.error('Error generating SQL script:', error);
    }
}

// Execute the main function
generateSqlScript();

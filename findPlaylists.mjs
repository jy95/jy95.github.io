import { readFile } from "fs/promises"

// Path to the JSON file
const filePath = "src/app/api/games/games.json";

// Set of years to match
const yearsToMatch = new Set(["2023"]);

async function findMatchingPlaylists() {
    try {
        // Read and parse the JSON file asynchronously
        const data = await readFile(filePath, 'utf8');
        const games = JSON.parse(data);

        // Create a regex pattern to match the specified years
        const yearPattern = new RegExp(`^(${Array.from(yearsToMatch).join('|')})`);

        // Filter games and extract matching playlist IDs
        const matchingPlaylistIds = games
            .filter(game => {
                const availableAt = String(game.availableAt || '');
                const endAt = String(game.endAt || '');
                return yearPattern.test(availableAt) || yearPattern.test(endAt);
            })
            .filter(game => game.playlistId !== undefined)
            .map(game => game.playlistId);

        // Output the matching playlist IDs
        console.log(JSON.stringify(matchingPlaylistIds, null, "\t"));
        
    } catch (err) {
        console.error('Error:', err.message); // More specific error message
    }
}

// Call the async function
await findMatchingPlaylists();

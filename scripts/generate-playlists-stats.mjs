import { readFile, writeFile, access } from "fs/promises";
import { resolve as resolvePath } from "path";


// Params
const csvFilePath = 'playlists_stats.csv';
const basePicturesPath = "./public"
const outputFilePath = 'playlists_stats.json';

// First line are headers
const numberOfHeaders = 1;

// Functions
const generateImagePath = (playlistId) => resolvePath(`${basePicturesPath}/covers/${playlistId}/cover.webp`);

// Function to parse CSV lines with quotes handling
function parseCSVLine(line) {
    const result = [];
    let inQuotes = false;
    let field = '';

    for (let char of line) {
        if (char === '"') {
            inQuotes = !inQuotes;  // Toggle the quotes flag
            field += char;  // Add the quote character to the field
        } else if (char === ',' && !inQuotes) {
            result.push(field);  // Push the field if not inside quotes
            field = '';  // Reset field for the next column
        } else {
            field += char;  // Add character to the current field
        }
    }

    // Push the last field
    result.push(field);
    return result.map(f => f.replace(/^"|"$/g, '').replace(/""/g, '"')); // Remove surrounding quotes and double quotes
}

async function readCSV(filePath) {
    const data = await readFile(filePath, 'utf8');
    const rows = data.split('\n').slice(numberOfHeaders);
    const games = [];

    for(let game of rows) {
        
        const columns = parseCSVLine(game);
        // Check if it is a real line or not
        if (columns.length < 4) continue;

        const [playlistId, title, views, watchTimeInMinutes] = columns;
        const imagePath = generateImagePath(playlistId);

        // Check if it is a gaming playlist 
        // How ? Local image path must exist ;)
        try {
            await access(imagePath);
            games.push({
                id: playlistId,
                title: title,
                imagePath: imagePath,
                views: Number.parseInt(views),
                watchTimeInMinutes: Number(watchTimeInMinutes)
            });
        } catch {
            console.log(`\t ${title} is not a game - skipping`);
            continue;
        }
    }

    return games;
}

async function writeJSON(filePath, data) {
    await writeFile(filePath, JSON.stringify(data, null, 2));
}

async function generateData() {
    const games = await readCSV(csvFilePath);
    await writeJSON(outputFilePath, games);
}

generateData();
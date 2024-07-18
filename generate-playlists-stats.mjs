import { readFile, writeFile, access } from "fs/promises";
import { resolve as resolvePath } from "path";


// Download from
// https://studio.youtube.com/channel/UCG0N7IV-C43AM9psxslejCQ/analytics/tab-content/period-default/explore?entity_type=CHANNEL&entity_id=UCG0N7IV-C43AM9psxslejCQ&r_dimensions=IN_CURATED_CONTENT&r_values=%27IN_CURATED_CONTENT%27&r_inclusive_starts=&r_exclusive_ends=&time_period=4_weeks&explore_type=TABLE_AND_CHART&metric=VIEWS&granularity=DAY&t_metrics=VIEWS&t_metrics=WATCH_TIME&dimension=PLAYLIST&o_column=VIEWS&o_direction=ANALYTICS_ORDER_DIRECTION_DESC
const csvFilePath = 'Informations relatives aux tableaux.csv';
const basePicturesPath = "./public"
const outputFilePath = 'playlists_stats.json';

// First line are headers, second a total summary
const numberOfHeaders = 2;

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

        const [playlistId, title, views, watchTimeInHours] = columns;
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
                watchTimeInHours: Number(watchTimeInHours)
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
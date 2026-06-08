import { readFile, writeFile, access } from "fs/promises";
import { resolve as resolvePath, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname: string = dirname(fileURLToPath(import.meta.url));

// Params
const csvFilePath: string = resolvePath(__dirname, '..', 'playlists_stats.csv');
const basePicturesPath: string = resolvePath(__dirname, '..', 'public');
const outputFilePath: string = resolvePath(__dirname, '..', 'playlists_stats.json');

// First line are headers
const numberOfHeaders: number = 1;

// Define an interface for the final output structure
interface GameStats {
    id: string;
    title: string;
    imagePath: string;
    views: number;
    watchTimeInMinutes: number;
}

// Functions
const generateImagePath = (playlistId: string): string => resolvePath(`${basePicturesPath}/covers/${playlistId}/cover.webp`);

// Function to parse CSV lines with quotes handling
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let inQuotes: boolean = false;
    let field: string = '';

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

async function readCSV(filePath: string): Promise<GameStats[]> {
    const data: string = await readFile(filePath, 'utf8');
    const rows: string[] = data.split('\n').slice(numberOfHeaders);
    const games: GameStats[] = [];

    for (let game of rows) {
        
        const columns: string[] = parseCSVLine(game);
        // Check if it is a real line or not
        if (columns.length < 4) continue;

        const [playlistId, title, views, watchTimeInMinutes] = columns;
        const imagePath: string = generateImagePath(playlistId);

        // Check if it is a gaming playlist 
        // How ? Local image path must exist ;)
        try {
            await access(imagePath);
            games.push({
                id: playlistId,
                title: title,
                imagePath: imagePath,
                views: Number.parseInt(views, 10),
                watchTimeInMinutes: Number(watchTimeInMinutes)
            });
        } catch {
            console.log(`\t ${title} is not a game - skipping`);
            continue;
        }
    }

    return games;
}

async function writeJSON(filePath: string, data: GameStats[]): Promise<void> {
    await writeFile(filePath, JSON.stringify(data, null, 2));
}

async function generateData(): Promise<void> {
    const games: GameStats[] = await readCSV(csvFilePath);
    await writeJSON(outputFilePath, games);
}

generateData();
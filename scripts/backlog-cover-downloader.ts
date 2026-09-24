import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncCoversBySearch } from './common/coverSearchRunner';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSON_FILE = path.resolve(__dirname, '..', 'src/app/api/backlog/backlog.json');
const OUTPUT_ROOT = path.resolve(__dirname, '..', 'public/backlogcovers');

const PLATFORMS_MAP: Record<number, string> = {
    1: 'PC', 2: 'GBA', 3: 'PSP', 4: 'PS1', 5: 'PS2', 6: 'PS3', 7: 'SCUMMVM',
};

interface Game {
    /** Unique identifier for the backlog game entry. */
    id: number | string;
    /** Title of the video game. */
    title: string;
    /** Platform identifier numeric code mapping to `PLATFORMS_MAP`. */
    platform: number;
}

/**
 * Reads the game backlog from `backlog.json` and runs the search sync runner
 * to fetch and save missing cover art for each game.
 *
 * @returns A promise that resolves when all backlog game covers have been processed.
 * @throws {Error} Throws an error if reading or parsing `backlog.json` fails.
 */
export async function run(): Promise<void> {
    let games: Game[];
    try {
        games = JSON.parse(fs.readFileSync(JSON_FILE, 'utf-8'));
    } catch (error) {
        console.error('❌ Failed to read the backlog.json file');
        throw error;
    }

    await syncCoversBySearch(
        games.map((game) => ({
            id: game.id,
            label: game.title,
            searchQuery: `${game.title} ${PLATFORMS_MAP[game.platform] || ''} official box art`.trim(),
        })),
        { outputRoot: OUTPUT_ROOT }
    );
}

await run();
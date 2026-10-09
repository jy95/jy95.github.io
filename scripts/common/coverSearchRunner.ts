import fs from 'node:fs';
import path from 'node:path';
import { imageSearch, closeBrowser } from 'imgsearch-api';
import { sleep, randomDelay } from './delay';
import { downloadImageBuffer } from './imageDownload';
import { convertBufferToWebp } from './imageConvert';

export interface CoverSearchItem {
    /** Unique identifier for the item (used as directory name). */
    id: string | number;
    /** Human-readable label used for logging purposes. */
    label: string;
    /** Search query string sent to the image search engines. */
    searchQuery: string;
}

export interface CoverSearchOptions {
    /** Base destination folder path where item subdirectories are located or created. */
    outputRoot: string;
    /** Min and max delay in milliseconds between processing consecutive items. Defaults to `[1000, 2000]`. */
    delayRangeMs?: [number, number];
    /** Search engines to query. Defaults to `['bing', 'ddg']`. */
    searchEngines?: ('bing' | 'ddg' | 'yandex' | 'google')[];
    /** Maximum number of search results to fetch per item query. Defaults to `5`. */
    resultsPerSearch?: number;
}

const COVER_FILE_REGEX = /^cover\.(webp|png|jpe?g|gif|avif|bmp|svg)$/i;

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

function hasCoverFile(itemDir: string): boolean {
    if (!fs.existsSync(itemDir)) return false;
    return fs.readdirSync(itemDir).some((file) => COVER_FILE_REGEX.test(file));
}

async function downloadAndConvertCover(url: string, targetDir: string): Promise<string | null> {
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    const filePath = path.join(targetDir, 'cover.webp');
    const tmpPath = `${filePath}.tmp`;

    try {
        const { buffer } = await downloadImageBuffer(url);
        await convertBufferToWebp(buffer, tmpPath);
        fs.renameSync(tmpPath, filePath);
        return 'cover.webp';
    } catch (error: unknown) {
        if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
        
        const message = error instanceof Error && error.name === 'AbortError' 
            ? 'Request timed out' 
            : getErrorMessage(error);
        console.error(`      ❌ Download error: ${message}`);
        return null;
    }
}

export async function syncCoversBySearch(
    items: CoverSearchItem[],
    options: CoverSearchOptions
): Promise<void> {
    const {
        outputRoot,
        delayRangeMs = [1000, 2000],
        searchEngines = ['bing', 'ddg'],
        resultsPerSearch = 5,
    } = options;

    console.log(`🚀 Starting cover fetch for ${items.length} items...`);

    try {
        for (const item of items) {
            const itemDir = path.join(outputRoot, String(item.id));

            if (hasCoverFile(itemDir)) {
                console.log(`⏩ [${item.id}] ${item.label} (Already exists)`);
                continue;
            }

            console.log(`🔍 Searching: "${item.searchQuery}"`);
            await processCoverSearch(item, itemDir, searchEngines, resultsPerSearch);

            const delay = randomDelay(delayRangeMs[0], delayRangeMs[1]);
            console.log(`    ⏳ Waiting ${delay} ms...`);
            await sleep(delay);
        }
    } finally {
        await closeBrowser();
    }

    console.log('\n✨ Done!');
}

async function processCoverSearch(
    item: CoverSearchItem,
    itemDir: string,
    searchEngines: string[],
    resultsPerSearch: number
): Promise<void> {
    try {
        const results = await imageSearch(item.searchQuery, { engines: searchEngines, n: resultsPerSearch });
        const imageUrl = results[0] ?? null;

        if (imageUrl) {
            console.log(`    🔗 Image found: ${imageUrl}`);
            const saved = await downloadAndConvertCover(imageUrl, itemDir);
            if (saved) console.log(`    ✅ Saved: ${item.id}/${saved}`);
        } else {
            console.log(`    ⚠️ No image found for: ${item.label} (${item.id})`);
        }
    } catch (error: unknown) {
        console.error(`    ❌ Search error: ${getErrorMessage(error)}`);
    }
}

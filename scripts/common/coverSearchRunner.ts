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

/**
 * Iterates through a list of items, searches for missing cover images, downloads the top result,
 * converts it to `cover.webp`, and applies a randomized throttle delay between each item.
 *
 * Items that already contain a `cover.*` file in their folder are automatically skipped.
 * Used by `backlog-cover-downloader.ts` and `company-logo-downloader.ts`.
 *
 * @param items - Array of items containing search queries and identification data.
 * @param options - Configuration options for output paths, delays, and search settings.
 * @param options.outputRoot - Root folder path where cover folders are saved.
 * @param options.delayRangeMs - Tuple specifying minimum and maximum delay in milliseconds between requests.
 * @param options.searchEngines - Array of search engines to search across.
 * @param options.resultsPerSearch - Number of image results requested per search.
 * @returns A promise that resolves when all items have been processed and the browser instance is closed.
 */
export async function syncCoversBySearch(items: CoverSearchItem[], options: CoverSearchOptions): Promise<void> {
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
            const existingFiles = fs.existsSync(itemDir) ? fs.readdirSync(itemDir) : [];

            if (existingFiles.some((file) => file.startsWith('cover.'))) {
                console.log(`⏩ [${item.id}] ${item.label} (Already exists)`);
                continue;
            }

            console.log(`🔍 Searching: "${item.searchQuery}"`);
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
                console.error(`    ❌ Search error: ${error instanceof Error ? error.message : String(error)}`);
            }

            const delay = randomDelay(delayRangeMs[0], delayRangeMs[1]);
            console.log(`    ⏳ Waiting ${delay} ms...`);
            await sleep(delay);
        }
    } finally {
        await closeBrowser();
    }

    console.log('\n✨ Done!');
}

/**
 * Downloads an image from a URL, converts it to WebP format, and writes it to disk safely
 * via a temporary file before renaming.
 *
 * @param url - The remote image URL to download.
 * @param targetDir - The directory where `cover.webp` should be saved.
 * @returns A promise that resolves to the saved file name (`'cover.webp'`) on success, or `null` if the process failed.
 */
async function downloadAndConvertCover(url: string, targetDir: string): Promise<string | null> {
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    const fileName = 'cover.webp';
    const filePath = path.join(targetDir, fileName);
    const tmpPath = `${filePath}.tmp`;

    try {
        const { buffer } = await downloadImageBuffer(url);
        await convertBufferToWebp(buffer, tmpPath);
        fs.renameSync(tmpPath, filePath);
        return fileName;
    } catch (error: unknown) {
        if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
        if (error instanceof Error && error.name === 'AbortError') {
            console.error('      ❌ Download error: Request timed out');
        } else {
            console.error(`      ❌ Download error: ${error instanceof Error ? error.message : String(error)}`);
        }
        return null;
    }
}
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { validateFolder } from './common/utils';
import { resolveWithin } from './common/pathSafety';
import { downloadImageBuffer } from '../common/imageDownload';
import { convertBufferToWebp } from '../common/imageConvert';
import { replaceCoverAtomically } from '../common/coverReplace';

import type { Database } from 'better-sqlite3';
import type { AddCoverPayload } from './common/types';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Downloads an image from a given URL and returns its binary buffer.
 *
 * Wraps `downloadImageBuffer` to provide contextual error messaging upon failure.
 *
 * @param url - The direct remote URL of the image to download.
 * @returns A promise that resolves to the raw image buffer.
 * @throws {Error} Throws an error if the image fails to download.
 */
async function downloadImage(url: string): Promise<Buffer> {
    try {
        const { buffer } = await downloadImageBuffer(url);
        return buffer;
    } catch (error) {
        throw new Error(`Failed to download image from ${url}: ${error}`);
    }
}

/**
 * Converts a raw image buffer to WebP format, resizes it to 250x250 pixels,
 * and saves it to the specified output path.
 *
 * @param imageBuffer - The raw binary buffer of the source image.
 * @param outputPath - The target file path on disk where the processed `.webp` file will be saved.
 * @returns A promise that resolves when conversion and file writing are complete.
 * @throws {Error} Throws an error if image processing or writing fails.
 */
async function convertAndResizeImage(imageBuffer: Buffer, outputPath: string): Promise<void> {
    try {
        await convertBufferToWebp(imageBuffer, outputPath, { width: 250, height: 250 });
    } catch (error) {
        throw new Error(`Failed to convert and resize image: ${error}`);
    }
}

/**
 * Downloads an image from a URL, converts and resizes it to a 250x250 WebP,
 * and replaces the target entity's cover directory atomically within the static `public` assets folder.
 *
 * @param _db - The SQLite database instance (unused in this handler, preserved for signature consistency).
 * @param payload - The request payload containing necessary cover addition metadata.
 * @param payload.imageURL - The remote URL of the cover image to download.
 * @param payload.folder - The base folder category (e.g., `'games'`, `'companies'`).
 * @param payload.identifierValue - The unique identifier or slug used as the subdirectory name.
 * @returns A promise that resolves when the cover replacement process finishes successfully.
 * @throws {Error} Throws an error if required payload fields are missing, folder validation fails,
 *                 or any step in downloading, converting, or swapping the cover encounters an error.
 */
export async function addCover(_db: Database, payload: AddCoverPayload): Promise<void> {
    const { imageURL, folder, identifierValue } = payload;

    if (!imageURL || !folder || !identifierValue) {
        throw new Error('Missing required fields: imageURL, folder, identifierValue');
    }
    validateFolder(folder);

    const publicPath = resolve(__dirname, '..', '..', 'public');
    const folderRoot = resolve(publicPath, folder);
    const folderPath = resolveWithin(folderRoot, identifierValue);

    console.log(`📁 Processing cover for ${folder}/${identifierValue}...`);

    await replaceCoverAtomically(folderPath, async (stagingDir) => {
        console.log(`⬇️ Downloading image from ${imageURL}...`);
        const imageBuffer = await downloadImage(imageURL);

        console.log(`🔄 Converting and resizing image to WebP (250x250)...`);
        await convertAndResizeImage(imageBuffer, resolve(stagingDir, 'cover.webp'));
    });

    console.log(`✅ Cover added successfully: ${resolve(folderPath, 'cover.webp')}`);
}
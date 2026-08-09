import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { mkdir, rm } from 'fs/promises';
import sharp from 'sharp';

import type { Database } from 'better-sqlite3';
import type { Folder } from './common/types';

interface AddCoverPayload {
  imageURL: string;
  folder: Folder;
  identifierValue: string;
}

const __dirname = dirname(fileURLToPath(import.meta.url));

const allowedFolders = new Set<Folder>([
  'covers',
  'testscovers',
  'backlogcovers',
]);

/**
 * Validates that a folder name is allowed.
 * @param folder The folder name to validate.
 */
function validateFolder(folder: string): asserts folder is Folder {
  if (!allowedFolders.has(folder as Folder)) {
    throw new Error(`Invalid folder name: ${folder}`);
  }
}

/**
 * Downloads an image from a URL using native Node.js fetch.
 */
async function downloadImage(url: string): Promise<Buffer> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    throw new Error(`Failed to download image from ${url}: ${error}`);
  }
}

/**
 * Converts and resizes an image to WebP format using sharp.
 * 
 * @param imageBuffer The image buffer to process
 * @param outputPath The path where the WebP file will be saved
 */
async function convertAndResizeImage(
  imageBuffer: Buffer,
  outputPath: string
): Promise<void> {
  try {
    await sharp(imageBuffer)
      .resize(250, 250, { fit: 'inside' })
      .webp()
      .toFile(outputPath);
  } catch (error) {
    throw new Error(`Failed to convert and resize image: ${error}`);
  }
}

/**
 * Adds a cover image for a game or backlog entry.
 * 
 * Process:
 * 1. Validate the folder parameter
 * 2. Create/recreate the target folder structure
 * 3. Download the image from the provided URL
 * 4. Convert and resize to WebP format (250x250)
 */
export async function addCover(
  _db: Database,
  payload: AddCoverPayload
): Promise<void> {
  const { imageURL, folder, identifierValue } = payload;

  // Validate inputs
  if (!imageURL || !folder || !identifierValue) {
    throw new Error('Missing required fields: imageURL, folder, identifierValue');
  }

  validateFolder(folder);

  // Define paths
  const publicPath = resolve(__dirname, '..', '..', 'public');
  const folderPath = resolve(publicPath, folder, identifierValue);
  const filePath = resolve(folderPath, 'cover.webp');

  try {
    console.log(`📁 Processing cover for ${folder}/${identifierValue}...`);

    // Delete existing folder if it exists
    try {
      console.log(`🗑️  Removing existing folder...`);
      await rm(folderPath, { recursive: true, force: true });
    } catch {
      // Folder doesn't exist, which is fine
    }

    // Create target folder
    console.log(`📂 Creating folder...`);
    await mkdir(folderPath, { recursive: true });

    // Download the image
    console.log(`⬇️  Downloading image from ${imageURL}...`);
    const imageBuffer = await downloadImage(imageURL);

    // Convert and resize to WebP
    console.log(`🔄 Converting and resizing image to WebP (250x250)...`);
    await convertAndResizeImage(imageBuffer, filePath);

    console.log(`✅ Cover added successfully: ${filePath}`);
  } catch (error) {
    // Clean up on error
    try {
      await rm(folderPath, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
    throw error;
  }
}

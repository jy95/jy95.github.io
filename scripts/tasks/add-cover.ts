import { fileURLToPath } from 'url';
import { dirname, resolve, normalize, relative } from 'path';
import { mkdir, rm, rename } from 'fs/promises';
import { randomBytes } from 'crypto';
import sharp from 'sharp';

import type { validateFolder } from './common/utils';

import type { Database } from 'better-sqlite3';
import type { AddCoverPayload } from './common/types';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Validates an identifier value to prevent path traversal attacks.
 * Rejects empty values, absolute paths, and paths that would escape the folder root.
 * @param identifierValue The identifier value to validate.
 * @param folderRoot The root directory that the identifier must stay within.
 */
function validateIdentifier(identifierValue: string, folderRoot: string): void {
  // Reject empty values
  if (!identifierValue || identifierValue.trim() === '') {
    throw new Error('Identifier value cannot be empty');
  }

  // Normalize and resolve the full path
  const resolvedPath = resolve(folderRoot, identifierValue);
  const normalizedPath = normalize(resolvedPath);

  // Get the relative path from folderRoot to the resolved path
  const relativePath = relative(folderRoot, normalizedPath);

  // Check if the path escapes the folder root
  // If it starts with '..' or is an absolute path outside folderRoot, it's invalid
  if (relativePath.startsWith('..') || resolve(folderRoot, relativePath) !== normalizedPath) {
    throw new Error(`Invalid identifier value: path traversal detected in "${identifierValue}"`);
  }

  // Additional check: reject absolute paths
  if (resolve(identifierValue) === normalize(identifierValue)) {
    throw new Error(`Invalid identifier value: absolute paths not allowed "${identifierValue}"`);
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
 * 1. Validate the folder parameter and identifier value
 * 2. Create a staging directory for the new cover
 * 3. Download the image from the provided URL
 * 4. Convert and resize to WebP format (250x250)
 * 5. Atomically replace the original folder with the staging directory
 *
 * This approach ensures the original cover is never deleted before the replacement
 * succeeds, preventing data loss on failure.
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
  const folderRoot = resolve(publicPath, folder);

  // Validate identifier before constructing paths
  validateIdentifier(identifierValue, folderRoot);

  const folderPath = resolve(folderRoot, identifierValue);

  // Create a unique staging directory (sibling to target, not inside it)
  const stagingDirName = `.staging-${identifierValue}-${randomBytes(8).toString('hex')}`;
  const stagingPath = resolve(folderRoot, stagingDirName);
  const stagingFilePath = resolve(stagingPath, 'cover.webp');

  let shouldCleanupStaging = true;

  try {
    console.log(`📁 Processing cover for ${folder}/${identifierValue}...`);

    // Create staging directory
    console.log(`📂 Creating staging directory...`);
    await mkdir(stagingPath, { recursive: true });

    // Download the image
    console.log(`⬇️  Downloading image from ${imageURL}...`);
    const imageBuffer = await downloadImage(imageURL);

    // Convert and resize to WebP in staging directory
    console.log(`🔄 Converting and resizing image to WebP (250x250)...`);
    await convertAndResizeImage(imageBuffer, stagingFilePath);

    // Successfully created the new cover in staging directory
    // Now perform the atomic swap - this is in a separate try/catch to preserve staging on swap failure
    console.log(`🔄 Replacing original folder with new cover...`);

    try {
      // Remove the original folder if it exists
      await rm(folderPath, { recursive: true, force: true });

      // Rename staging directory to target (atomic operation)
      await rename(stagingPath, folderPath);

      console.log(`✅ Cover added successfully: ${resolve(folderPath, 'cover.webp')}`);
    } catch (swapError) {
      // If the swap fails, preserve staging directory for manual recovery
      shouldCleanupStaging = false;
      console.error(`Failed to complete cover replacement. Staging directory preserved at: ${stagingPath}`);
      throw new Error(`Failed to complete cover replacement: ${swapError}`);
    }
  } catch (error) {
    // Clean up staging directory only on early failures (before swap attempt)
    if (shouldCleanupStaging) {
      try {
        await rm(stagingPath, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }
    throw error;
  }
}

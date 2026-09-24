import sharp from 'sharp';

import type { FitEnum } from "sharp";

export interface ConvertToWebpOptions {
    /** Target width in pixels. If omitted, width scales proportionally to height. */
    width?: number;
    /** Target height in pixels. If omitted, height scales proportionally to width. */
    height?: number;
    /** Resizing strategy specifying how the image should fit the given dimensions. Defaults to `'inside'`. */
    fit?: keyof FitEnum;
}

/**
 * Converts (and resizes if needed) raw image bytes to WebP format and saves it to disk.
 *
 * Shared across all cover image pipelines (games, backlog, tests, companies, etc.).
 *
 * @param imageBuffer - The raw binary buffer of the source image to process.
 * @param outputPath - The target file path on disk where the resulting `.webp` file will be written.
 * @param options - Resizing configuration options.
 * @param options.width - Target width in pixels.
 * @param options.height - Target height in pixels.
 * @param options.fit - Resizing fit mode (e.g., `'inside'`, `'cover'`, `'contain'`). Defaults to `'inside'`.
 * @returns A promise that resolves when the WebP image has been written to disk.
 */
export async function convertBufferToWebp(
    imageBuffer: Buffer,
    outputPath: string,
    { width, height, fit = 'inside' }: ConvertToWebpOptions = {}
): Promise<void> {
    let pipeline = sharp(imageBuffer);
    if (width || height) {
        pipeline = pipeline.resize(width, height, { fit });
    }
    await pipeline.webp().toFile(outputPath);
}
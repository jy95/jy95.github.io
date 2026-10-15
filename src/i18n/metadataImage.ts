import { cache } from 'react';
import path from 'node:path';
import sharp from 'sharp';

const publicDirectory = path.resolve('public');

// Inspect each asset once per render request; never guess dimensions from UI sizes.
const inspectImage = cache(async (url: string) => {
    const filename = path.resolve(publicDirectory, `.${url}`);
    if (!url.startsWith('/') || !filename.startsWith(`${publicDirectory}${path.sep}`)) return undefined;
    try {
        const { width, height, format } = await sharp(filename).metadata();
        if (!width || !height || !format || !['jpeg', 'png', 'webp', 'gif'].includes(format)) return undefined;
        return { width, height, type: `image/${format}` };
    } catch {
        // Missing or unsupported artwork must not produce a broken social image.
        return undefined;
    }
});

export async function metadataImage(url: string, alt: string) {
    const properties = await inspectImage(url);
    return properties ? { url, alt, ...properties } : undefined;
}

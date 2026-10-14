import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { COVER_PATHS } from '@/domain/games/coverPaths';

export const SOCIAL_IMAGE_SIZE = { width: 1200, height: 630 };

function escapeXml(value: string): string {
    return value.replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char] ?? char);
}

async function artworkBuffer(artwork: string | null): Promise<Buffer | undefined> {
    if (!artwork || !Object.values(COVER_PATHS).some(root => artwork.startsWith(`${root}/`))) return undefined;
    const publicRoot = path.resolve(process.cwd(), 'public');
    const file = path.resolve(publicRoot, `.${artwork}`);
    if (!Object.values(COVER_PATHS).some(root => file.startsWith(`${path.join(publicRoot, root)}${path.sep}`))) return undefined;
    try {
        return await sharp(await readFile(file), { limitInputPixels: 40000000 })
            .resize(420, 500, { fit: 'contain', background: '#182235' }).png().toBuffer();
    } catch { return undefined; }
}

// Reuse Next.js's bundled font so server images do not depend on system fonts.
const fontfile = path.join(process.cwd(), 'node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf');

async function renderText(text: string, width: number, fontSize: number, height: number): Promise<Buffer> {
    return sharp({ text: {
        text: `<span foreground="#ffffff">${escapeXml(text)}</span>`,
        font: `Geist ${fontSize}`, fontfile, width, dpi: 72, rgba: true, wrap: 'word-char',
    } }).resize({ width, height, fit: 'inside', withoutEnlargement: true }).png().toBuffer();
}

export async function renderSocialImage(title: string, subtitle: string, artwork: string | null): Promise<Buffer> {
    const image = await artworkBuffer(artwork);
    const left = image ? 520 : 80;
    const width = image ? 620 : 1040;
    const [brandText, titleText, subtitleText] = await Promise.all([
        renderText('GamesPassionFR', width, 28, 50),
        renderText(Array.from(title).slice(0, image ? 100 : 180).join(''), width, 44, 280),
        renderText(subtitle, width, 22, 50),
    ]);
    return sharp({ create: { ...SOCIAL_IMAGE_SIZE, channels: 3, background: '#182235' } })
        .composite([
            ...(image ? [{ input: image, left: 60, top: 65 }] : []),
            { input: brandText, left, top: 85 },
            { input: titleText, left, top: 190 },
            { input: subtitleText, left, top: 525 },
        ]).png().toBuffer();
}

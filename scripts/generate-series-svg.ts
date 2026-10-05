import sharp from 'sharp';
import { mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { buildCardEntry } from '@/domain/games';
import { COVER_PATHS } from '@/domain/games/coverPaths';

import { openDatabase } from './common/db';
import { convertBufferToWebp } from './common/imageConvert';

import type { Database } from 'better-sqlite3';
import type { RawGame } from '@/domain/games/types';

export type SeriesCoverGame = Pick<RawGame, 'title' | 'platform'> & {
    id: number;
    playlistId: string | null;
    videoId: string | null;
};

interface SeriesRow {
    id: number;
    name: string;
}

export interface SeriesCover extends SeriesRow {
    games: SeriesCoverGame[];
}

interface ImageSlot {
    x: number;
    y: number;
    width: number;
    height: number;
}

const REPOSITORY_ROOT = resolve(import.meta.dirname, '..');
const CANVAS_SIZE = 310;
const TILE_SIZE = 150;
const GAP = 10;
const MAXIMUM_COVERS = 4;

const IMAGE_LAYOUTS: readonly ImageSlot[][] = [
    [],
    [{ x: 0, y: 0, width: CANVAS_SIZE, height: CANVAS_SIZE }],
    [
        { x: 0, y: 0, width: TILE_SIZE, height: CANVAS_SIZE },
        { x: TILE_SIZE + GAP, y: 0, width: TILE_SIZE, height: CANVAS_SIZE },
    ],
    [
        { x: 0, y: 0, width: TILE_SIZE, height: CANVAS_SIZE },
        { x: TILE_SIZE + GAP, y: 0, width: TILE_SIZE, height: TILE_SIZE },
        {
            x: TILE_SIZE + GAP,
            y: TILE_SIZE + GAP,
            width: TILE_SIZE,
            height: TILE_SIZE,
        },
    ],
    [
        { x: 0, y: 0, width: TILE_SIZE, height: TILE_SIZE },
        { x: TILE_SIZE + GAP, y: 0, width: TILE_SIZE, height: TILE_SIZE },
        { x: 0, y: TILE_SIZE + GAP, width: TILE_SIZE, height: TILE_SIZE },
        {
            x: TILE_SIZE + GAP,
            y: TILE_SIZE + GAP,
            width: TILE_SIZE,
            height: TILE_SIZE,
        },
    ],
];

/**
 * Retain empty series and select the first four games by release date, then ID.
 */
export function querySeries(db: Database): SeriesCover[] {
    const series = db.prepare<[], SeriesRow>(`
        SELECT id, name
        FROM series
        ORDER BY id ASC
    `).all();

    const games = db.prepare<[number], SeriesCoverGame>(`
        SELECT
            g.id,
            g.title,
            g.platform,
            g.playlistId,
            g.videoId
        FROM series AS s
        JOIN series_games AS sg ON sg.serie = s.id
        JOIN games AS g ON g.id = sg.game
        WHERE s.id = ?
        ORDER BY g.releaseDate ASC, g.id ASC
        LIMIT ${MAXIMUM_COVERS}
    `);

    return series.map(serie => ({
        ...serie,
        games: games.all(serie.id),
    }));
}

export function loadSeries(): SeriesCover[] {
    const db = openDatabase({
        readonly: true,
        fileMustExist: true,
    });

    try {
        return querySeries(db);
    } finally {
        db.close();
    }
}

function escapeXml(value: string): string {
    return value.replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;',
    })[character] ?? character);
}

/**
 * Generate SVG without database or filesystem access.
 * Empty input produces a transparent canvas.
 * Extra covers are ignored in input order.
 */
export function generateSeriesSvg(
    name: string,
    sources: readonly string[],
): string {
    const slots = IMAGE_LAYOUTS[Math.min(sources.length, MAXIMUM_COVERS)] ?? [];
    const images = slots.map((slot, index) => {
        const source = sources[index];

        return (
            `  <image x="${slot.x}" y="${slot.y}" ` +
            `width="${slot.width}" height="${slot.height}" ` +
            `href="${escapeXml(source)}" ` +
            'preserveAspectRatio="xMidYMid slice"/>'
        );
    });

    return [
        '<svg xmlns="http://www.w3.org/2000/svg" ' +
            `width="${CANVAS_SIZE}" height="${CANVAS_SIZE}" ` +
            `viewBox="0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}">`,
        `  <title>${escapeXml(name)}</title>`,
        ...images,
        '</svg>',
        '',
    ].join('\n');
}

function gameCoverPath(game: SeriesCoverGame, root: string): string {
    // The games table requires at least one identifier; playlists take precedence.
    const identity = game.playlistId !== null
        ? { playlistId: game.playlistId }
        : { videoId: game.videoId ?? '' };
    const card = buildCardEntry({
        title: game.title,
        platform: game.platform,
        ...identity,
    }, COVER_PATHS.games);

    // YouTube identifiers are directory names, not filesystem paths.
    if (!/^[A-Za-z0-9_-]+$/.test(card.id)) {
        throw new Error(
            `Invalid cover identifier for game ${game.id}: ${card.id}`,
        );
    }

    return resolve(root, 'public', card.imagePath.slice(1));
}

/**
 * Embed image bytes as a PNG data URI so SVG rasterization stays self-contained.
 */
export async function embedCoverImage(buffer: Buffer): Promise<string> {
    const png = await sharp(buffer).png().toBuffer();
    return `data:image/png;base64,${png.toString('base64')}`;
}

export async function embedSeriesCovers(
    serie: SeriesCover,
    root = REPOSITORY_ROOT,
): Promise<string[]> {
    const sources: string[] = [];

    for (const game of serie.games.slice(0, MAXIMUM_COVERS)) {
        const source = gameCoverPath(game, root);

        try {
            sources.push(await embedCoverImage(await readFile(source)));
        } catch (cause) {
            throw new Error(
                `Cannot load cover for series ${serie.id}, ` +
                    `game ${game.id}: ${source}`,
                { cause },
            );
        }
    }

    return sources;
}

export async function writeSeriesCover(
    serie: SeriesCover,
    root = REPOSITORY_ROOT,
): Promise<void> {
    const sources = await embedSeriesCovers(serie, root);
    const outputDirectory = resolve(
        root,
        'public',
        COVER_PATHS.series.slice(1),
        String(serie.id),
    );

    await mkdir(outputDirectory, { recursive: true });

    const svg = generateSeriesSvg(serie.name, sources);

    try {
        await convertBufferToWebp(
            Buffer.from(svg, 'utf8'),
            resolve(outputDirectory, 'cover.webp'),
        );
    } catch (cause) {
        throw new Error(
            `Cannot convert cover for series ${serie.id} (${serie.name})`,
            { cause },
        );
    }
}

export async function generateSeriesCovers(): Promise<void> {
    for (const serie of loadSeries()) {
        await writeSeriesCover(serie);
        console.log(`Generated cover for series ${serie.id} (${serie.name})`);
    }
}

// Importing this module does not open the database or generate files.
if (
    process.argv[1] &&
    import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
    generateSeriesCovers().catch((error: unknown) => {
        console.error(error);
        process.exitCode = 1;
    });
}

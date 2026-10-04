import sharp from 'sharp';
import { mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { COVER_PATHS } from '@/domain/games/coverPaths';
import { extractGameCardProps } from '@/domain/games/youtube';

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

const repositoryRoot = resolve(
    dirname(fileURLToPath(import.meta.url)),
    '..',
);

const canvasSize = 310;
const tileSize = 150;
const secondPosition = 160;
const maximumCovers = 4;

/**
 * Retain empty series.
 * Select the first four games by release date, then database ID.
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
        LIMIT 4
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
    return value.replace(/[&<>"']/g, character => {
        switch (character) {
            case '&':
                return '&amp;';
            case '<':
                return '&lt;';
            case '>':
                return '&gt;';
            case '"':
                return '&quot;';
            default:
                return '&apos;';
        }
    });
}

function imageSlots(count: number): ImageSlot[] {
    if (count === 0) return [];

    if (count === 1) {
        return [{
            x: 0,
            y: 0,
            width: canvasSize,
            height: canvasSize,
        }];
    }

    const left: ImageSlot = {
        x: 0,
        y: 0,
        width: tileSize,
        height: canvasSize,
    };

    const topRight: ImageSlot = {
        x: secondPosition,
        y: 0,
        width: tileSize,
        height: tileSize,
    };

    const bottomRight: ImageSlot = {
        ...topRight,
        y: secondPosition,
    };

    if (count === 2) {
        return [
            left,
            { ...topRight, height: canvasSize },
        ];
    }

    if (count === 3) {
        return [left, topRight, bottomRight];
    }

    return [
        { ...left, height: tileSize },
        topRight,
        {
            x: 0,
            y: secondPosition,
            width: tileSize,
            height: tileSize,
        },
        bottomRight,
    ];
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
    const covers = sources.slice(0, maximumCovers);

    const images = imageSlots(covers.length).map((slot, index) => {
        const source = covers[index];

        if (source === undefined) {
            throw new Error(`Missing cover for SVG slot ${index}`);
        }

        return (
            `  <image x="${slot.x}" y="${slot.y}" ` +
            `width="${slot.width}" height="${slot.height}" ` +
            `href="${escapeXml(source)}" ` +
            'preserveAspectRatio="xMidYMid slice"/>'
        );
    });

    return [
        '<svg xmlns="http://www.w3.org/2000/svg" ' +
            `width="${canvasSize}" height="${canvasSize}" ` +
            `viewBox="0 0 ${canvasSize} ${canvasSize}">`,
        `  <title>${escapeXml(name)}</title>`,
        ...images,
        '</svg>',
        '',
    ].join('\n');
}

/**
 * Adapt nullable database fields to the canonical domain identity helper.
 * A present playlist identifier takes precedence over a video identifier.
 */
function coverIdentifier(game: SeriesCoverGame): string {
    const base = {
        title: game.title,
        platform: game.platform,
    };

    let rawGame: RawGame;

    if (typeof game.playlistId === 'string') {
        rawGame = {
            ...base,
            playlistId: game.playlistId,
        };
    } else if (typeof game.videoId === 'string') {
        rawGame = {
            ...base,
            videoId: game.videoId,
        };
    } else {
        throw new Error(
            `Missing playlist/video identifier for game ${game.id}`,
        );
    }

    const { id } = extractGameCardProps(rawGame);

    // YouTube identifiers are directory names, not filesystem paths.
    if (!/^[A-Za-z0-9_-]+$/.test(id)) {
        throw new Error(
            `Invalid cover identifier for game ${game.id}: ${id}`,
        );
    }

    return id;
}

/**
 * Embed PNG bytes so SVG rasterization does not need external images.
 * Convert the source WebP to PNG entirely in memory.
 */
export async function embedCoverImage(buffer: Buffer): Promise<string> {
    const png = await sharp(buffer).png().toBuffer();
    return `data:image/png;base64,${png.toString('base64')}`;
}

export async function embedSeriesCovers(
    serie: SeriesCover,
    root = repositoryRoot,
): Promise<string[]> {
    const sources: string[] = [];

    for (const game of serie.games.slice(0, maximumCovers)) {
        const identifier = coverIdentifier(game);

        const source = resolve(
            root,
            'public',
            COVER_PATHS.games.slice(1),
            identifier,
            'cover.webp',
        );

        try {
            const buffer = await readFile(source);
            sources.push(await embedCoverImage(buffer));
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
    root = repositoryRoot,
): Promise<void> {
    if (!Number.isSafeInteger(serie.id) || serie.id <= 0) {
        throw new Error(`Invalid series ID: ${serie.id}`);
    }

    const sources = await embedSeriesCovers(serie, root);

    const outputDirectory = resolve(
        root,
        'public',
        'seriescovers',
        String(serie.id),
    );

    await mkdir(outputDirectory, { recursive: true });

    const svg = generateSeriesSvg(serie.name, sources);
    const outputPath = resolve(outputDirectory, 'cover.webp');

    try {
        await convertBufferToWebp(Buffer.from(svg, 'utf8'), outputPath);
    } catch (cause) {
        throw new Error(
            `Cannot convert cover for series ${serie.id} (${serie.name})`,
            { cause },
        );
    }
}

export async function generateSeriesCovers(): Promise<void> {
    // loadSeries closes the database before filesystem processing starts.
    const series = loadSeries();

    for (const serie of series) {
        await writeSeriesCover(serie);

        console.log(
            `Generated cover for series ${serie.id} (${serie.name})`,
        );
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

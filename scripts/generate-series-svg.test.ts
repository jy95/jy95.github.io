import Database from 'better-sqlite3';
import sharp from 'sharp';
import { mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import { openDatabase } from './common/db';
import { convertBufferToWebp } from './common/imageConvert';
import {
    embedCoverImage,
    embedSeriesCovers,
    generateSeriesCovers,
    generateSeriesSvg,
    loadSeries,
    querySeries,
    writeSeriesCover,
} from './generate-series-svg';

import type { SeriesCover } from './generate-series-svg';

vi.mock('node:fs/promises', async (importOriginal) => {
    const actual = await importOriginal<typeof import('node:fs/promises')>();
    const mock = {
        ...actual,
        mkdir: vi.fn(),
        readFile: vi.fn(),
    };

    return { ...mock, default: mock };
});

vi.mock('./common/db', () => ({
    openDatabase: vi.fn(),
}));

vi.mock('./common/imageConvert', () => ({
    convertBufferToWebp: vi.fn(),
}));

const layouts = [
    [],
    [[0, 0, 310, 310]],
    [[0, 0, 150, 310], [160, 0, 150, 310]],
    [[0, 0, 150, 310], [160, 0, 150, 150], [160, 160, 150, 150]],
    [
        [0, 0, 150, 150],
        [160, 0, 150, 150],
        [0, 160, 150, 150],
        [160, 160, 150, 150],
    ],
];

const serie: SeriesCover = {
    id: 12,
    name: 'A & B',
    games: [{
        id: 3,
        title: 'Game',
        platform: 1,
        playlistId: 'playlist',
        videoId: 'video',
    }],
};

function createDatabase(): Database.Database {
    const db = new Database(':memory:');

    db.exec(`
        PRAGMA foreign_keys = ON;

        CREATE TABLE series (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL
        );

        CREATE TABLE games (
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            platform INTEGER NOT NULL,
            playlistId TEXT,
            videoId TEXT,
            releaseDate TEXT NOT NULL,
            CHECK(videoId IS NOT NULL OR playlistId IS NOT NULL)
        );

        CREATE TABLE series_games (
            serie INTEGER NOT NULL REFERENCES series(id),
            game INTEGER NOT NULL REFERENCES games(id),
            "order" INTEGER,
            UNIQUE(serie, game)
        );

        INSERT INTO series VALUES
            (1, 'Series'),
            (2, 'Empty');

        INSERT INTO games VALUES
            (1, 'First tie', 1, 'playlist', 'ignored', '2000-01-01'),
            (2, 'Second tie', 1, NULL, 'video', '2000-01-01'),
            (3, 'Earlier', 1, NULL, 'earlier', '1990-01-01'),
            (4, 'Later', 1, NULL, 'later', '2010-01-01'),
            (5, 'Last', 1, NULL, 'last', '2020-01-01'),
            (6, 'Unlinked', 1, NULL, 'unlinked', '1980-01-01');

        INSERT INTO series_games VALUES
            (1, 5, 0),
            (1, 2, 1),
            (1, 4, 2),
            (1, 1, 3),
            (1, 3, 4);
    `);

    return db;
}

let sourceBytes: Awaited<ReturnType<typeof readFile>> = Buffer.alloc(0);
let embeddedSource = '';

beforeEach(async () => {
    vi.resetAllMocks();

    sourceBytes = await sharp({
        create: {
            width: 20,
            height: 30,
            channels: 4,
            background: '#ff0000',
        },
    }).webp().toBuffer();

    embeddedSource = await embedCoverImage(sourceBytes);

    vi.mocked(readFile).mockResolvedValue(sourceBytes);
    vi.mocked(mkdir).mockResolvedValue(undefined);
    vi.mocked(convertBufferToWebp).mockResolvedValue(undefined);
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('filesystem mock exports', () => {
    it('shares mocked functions between named and default exports', async () => {
        const fs = await import('node:fs/promises');

        expect(fs.default.mkdir).toBe(mkdir);
        expect(fs.default.readFile).toBe(readFile);
        expect(vi.isMockFunction(fs.mkdir)).toBe(true);
        expect(vi.isMockFunction(fs.readFile)).toBe(true);
        expect(mkdir).not.toHaveBeenCalled();
        expect(readFile).not.toHaveBeenCalled();
    });
});

describe('SVG generation', () => {
    it.each([0, 1, 2, 3, 4, 5])(
        'renders the specified layout for %i covers',
        count => {
            const sources = Array.from(
                { length: count },
                (_, index) => `/cover-${index}.webp`,
            );

            const svg = generateSeriesSvg('Series', sources);
            const document = new DOMParser().parseFromString(
                svg,
                'image/svg+xml',
            );

            expect(document.querySelector('parsererror')).toBeNull();

            const root = document.documentElement;
            expect(root.getAttribute('width')).toBe('310');
            expect(root.getAttribute('height')).toBe('310');
            expect(root.getAttribute('viewBox')).toBe('0 0 310 310');

            const images = Array.from(
                document.querySelectorAll('image'),
            );

            expect(images).toHaveLength(Math.min(count, 4));

            expect(images.map(image =>
                ['x', 'y', 'width', 'height'].map(attribute =>
                    Number(image.getAttribute(attribute)),
                ),
            )).toEqual(layouts[Math.min(count, 4)]);

            images.forEach((image, index) => {
                expect(image.getAttribute('href')).toBe(sources[index]);
                expect(image.getAttribute('preserveAspectRatio'))
                    .toBe('xMidYMid slice');
            });

            expect(svg).toBe(generateSeriesSvg('Series', sources));
        },
    );

    it('escapes XML text and attributes', () => {
        const name = `A & <B> "C" 'D'`;
        const source = `/cover?name="a"&value='<b>'`;

        const svg = generateSeriesSvg(name, [source]);
        const document = new DOMParser().parseFromString(
            svg,
            'image/svg+xml',
        );

        expect(document.querySelector('parsererror')).toBeNull();
        expect(document.querySelector('title')?.textContent).toBe(name);
        expect(document.querySelector('image')?.getAttribute('href'))
            .toBe(source);

        expect(svg).toContain('&amp;');
        expect(svg).toContain('&lt;');
        expect(svg).toContain('&gt;');
        expect(svg).toContain('&quot;');
        expect(svg).toContain('&apos;');
    });

    it.each([0, 1, 2, 3, 4, 5])(
        'rasterizes %i covers to a valid 310x310 WebP in memory',
        async count => {
            const sources = Array.from(
                { length: count },
                () => embeddedSource,
            );

            const svg = generateSeriesSvg('Series', sources);
            const webp = await sharp(Buffer.from(svg)).webp().toBuffer();

            expect(await sharp(webp).metadata()).toMatchObject({
                format: 'webp',
                width: 310,
                height: 310,
            });

            const { data, info } = await sharp(webp)
                .ensureAlpha()
                .raw()
                .toBuffer({ resolveWithObject: true });

            const expectedLayout = layouts[Math.min(count, 4)];
            if (expectedLayout === undefined) {
                throw new Error(`Missing layout for ${count} covers`);
            }

            for (const rectangle of expectedLayout) {
                const [x, y, width, height] = rectangle;

                if (
                    x === undefined ||
                    y === undefined ||
                    width === undefined ||
                    height === undefined
                ) {
                    throw new Error('Invalid test rectangle');
                }

                const centerX = x + Math.floor(width / 2);
                const centerY = y + Math.floor(height / 2);

                const offset = (
                    centerY * info.width + centerX
                ) * info.channels;

                expect(data[offset]).toBeGreaterThan(230);
                expect(data[offset + 1]).toBeLessThan(25);
                expect(data[offset + 2]).toBeLessThan(25);
                expect(data[offset + 3]).toBe(255);
            }

            if (count === 0) {
                for (let offset = 3; offset < data.length; offset += 4) {
                    expect(data[offset]).toBe(0);
                }
            }

            if (count >= 2) {
                const gapOffset = (
                    75 * info.width + 155
                ) * info.channels;

                expect(data[gapOffset + 3]).toBe(0);
            }
        },
    );
});

describe('database queries and cleanup', () => {
    it('imports without opening the database or generating files', async () => {
        vi.resetModules();
        await import('./generate-series-svg');

        expect(openDatabase).not.toHaveBeenCalled();
        expect(readFile).not.toHaveBeenCalled();
        expect(mkdir).not.toHaveBeenCalled();
        expect(convertBufferToWebp).not.toHaveBeenCalled();
    });

    it('joins membership, orders releases and ties, and retains empty series', () => {
        const db = createDatabase();

        try {
            const result = querySeries(db);

            expect(result.map(entry => [entry.id, entry.name]))
                .toEqual([[1, 'Series'], [2, 'Empty']]);

            expect(result[0]?.games.map(game => game.id))
                .toEqual([3, 1, 2, 4]);

            expect(result[1]?.games).toEqual([]);
            expect(querySeries(db)).toEqual(result);
        } finally {
            db.close();
        }
    });

    it('opens read-only and closes the database after success', () => {
        const db = createDatabase();

        try {
            vi.mocked(openDatabase).mockReturnValue(db);

            expect(loadSeries()).toHaveLength(2);
            expect(openDatabase).toHaveBeenCalledWith({
                readonly: true,
                fileMustExist: true,
            });
            expect(db.open).toBe(false);
        } finally {
            if (db.open) db.close();
        }
    });

    it('closes the database after a query failure', () => {
        const db = new Database(':memory:');

        try {
            vi.mocked(openDatabase).mockReturnValue(db);

            expect(() => loadSeries()).toThrow('no such table');
            expect(db.open).toBe(false);
        } finally {
            if (db.open) db.close();
        }
    });

    it('propagates database opening failures', () => {
        const error = new Error('Database unavailable');

        vi.mocked(openDatabase).mockImplementation(() => {
            throw error;
        });

        expect(() => loadSeries()).toThrow(error);
    });

    it('closes the database before output processing fails', async () => {
        const db = createDatabase();

        try {
            vi.mocked(openDatabase).mockReturnValue(db);
            vi.mocked(mkdir).mockRejectedValue(
                new Error('Permission denied'),
            );

            await expect(generateSeriesCovers())
                .rejects.toThrow('Permission denied');

            expect(db.open).toBe(false);
        } finally {
            if (db.open) db.close();
        }
    });
});

describe('cover output', () => {
    it('uses playlist precedence and writes through the shared WebP helper', async () => {
        await writeSeriesCover(serie, '/repository');

        expect(readFile).toHaveBeenCalledWith(resolve(
            '/repository/public/covers/playlist/cover.webp',
        ));

        expect(mkdir).toHaveBeenCalledWith(
            resolve('/repository/public/seriescovers/12'),
            { recursive: true },
        );

        expect(convertBufferToWebp).toHaveBeenCalledWith(
            Buffer.from(generateSeriesSvg(
                serie.name,
                [embeddedSource],
            )),
            resolve('/repository/public/seriescovers/12/cover.webp'),
        );
    });

    it('uses a video identifier when the playlist identifier is absent', async () => {
        await embedSeriesCovers({
            ...serie,
            games: serie.games.map(game => ({
                ...game,
                playlistId: null,
            })),
        }, '/repository');

        expect(readFile).toHaveBeenCalledWith(resolve(
            '/repository/public/covers/video/cover.webp',
        ));
    });

    it('writes an empty series without reading source files', async () => {
        await writeSeriesCover({
            ...serie,
            games: [],
        }, '/repository');

        expect(readFile).not.toHaveBeenCalled();
        expect(convertBufferToWebp).toHaveBeenCalledWith(
            Buffer.from(generateSeriesSvg(serie.name, [])),
            resolve('/repository/public/seriescovers/12/cover.webp'),
        );
    });

    it('never reads a fifth game', async () => {
        await embedSeriesCovers({
            ...serie,
            games: Array.from({ length: 5 }, (_, id) => ({
                id,
                title: 'Game',
                platform: 1,
                playlistId: null,
                videoId: `video${id}`,
            })),
        }, '/repository');

        expect(readFile).toHaveBeenCalledTimes(4);

        for (let index = 0; index < 4; index += 1) {
            expect(readFile).toHaveBeenNthCalledWith(
                index + 1,
                resolve(
                    `/repository/public/covers/video${index}/cover.webp`,
                ),
            );
        }
    });

    it.each(['', '../escape', 'a/b', 'a\\b'])(
        'rejects an invalid identifier: %s',
        async playlistId => {
            await expect(embedSeriesCovers({
                ...serie,
                games: serie.games.map(game => ({
                    ...game,
                    playlistId,
                })),
            })).rejects.toThrow('Invalid cover identifier');

            expect(readFile).not.toHaveBeenCalled();
        },
    );

    it('reports missing covers with their original cause', async () => {
        const cause = new Error('ENOENT');
        vi.mocked(readFile).mockRejectedValue(cause);

        await expect(writeSeriesCover(serie, '/repository'))
            .rejects.toMatchObject({
                message: expect.stringContaining(
                    'Cannot load cover for series 12, game 3:',
                ),
                cause,
            });

        expect(mkdir).not.toHaveBeenCalled();
        expect(convertBufferToWebp).not.toHaveBeenCalled();
    });

    it('reports invalid image bytes without generating output', async () => {
        vi.mocked(readFile).mockResolvedValue(
            Buffer.from('not an image'),
        );

        await expect(writeSeriesCover(serie, '/repository'))
            .rejects.toThrow(
                'Cannot load cover for series 12, game 3:',
            );

        expect(mkdir).not.toHaveBeenCalled();
        expect(convertBufferToWebp).not.toHaveBeenCalled();
    });

    it('propagates directory creation failures', async () => {
        vi.mocked(mkdir).mockRejectedValue(
            new Error('Permission denied'),
        );

        await expect(writeSeriesCover(serie))
            .rejects.toThrow('Permission denied');

        expect(convertBufferToWebp).not.toHaveBeenCalled();
    });

    it('reports conversion failures with their original cause', async () => {
        const cause = new Error('Conversion failed');
        vi.mocked(convertBufferToWebp).mockRejectedValue(cause);

        await expect(writeSeriesCover(serie))
            .rejects.toMatchObject({
                message: 'Cannot convert cover for series 12 (A & B)',
                cause,
            });
    });
});

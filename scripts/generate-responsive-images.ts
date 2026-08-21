import sharp from 'sharp';
import { readFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

import type { OutputInfo } from 'sharp';

const __dirname = fileURLToPath(dirname(import.meta.url));

interface GameEntry {
    playlistId?: string | number;
    videoId?: string | number;
    coverFile?: string;
    title?: string;
}

interface StoreConfig {
    coversRootPath: string;
    defaultCoverFile: string;
    games: GameEntry[];
}

interface ResizeConfig {
    width: number;
    height: number;
    suffix: string;
}

const testsJson: GameEntry[] = JSON.parse(
    await readFile(
        resolve(__dirname, '../src/app/api/tests/tests.json'),
        'utf-8'
    )
);

const gamesJson: GameEntry[] = JSON.parse(
    await readFile(
        resolve(__dirname, '../src/app/api/games/games.json'),
        'utf-8'
    )
);

const resizeConfig: ResizeConfig[] = [
    {
        width: 150,
        height: 150,
        suffix: 'small'
    },
    {
        width: 200,
        height: 200,
        suffix: 'medium'
    },
    {
        width: 250,
        height: 250,
        suffix: 'big'
    }
];

async function resizePicture(
    directory: string,
    gameId: string,
    pathIcon: string
): Promise<OutputInfo[]> {
    const image = await readFile(pathIcon);

    const promises = resizeConfig.map(({ width, height, suffix }) =>
        sharp(image, { failOn: 'none' })
            .resize({
                width,
                height,
                fit: 'inside'
            })
            .toFile(
                resolve(
                    directory,
                    gameId,
                    `cover@${suffix}.webp`
                )
            )
    );

    return Promise.all(promises);
}

async function resizePicturesInFolder(): Promise<void> {
    const all_games: Record<string, StoreConfig> = {
        games: {
            coversRootPath: 'covers',
            defaultCoverFile: 'cover.webp',
            games: gamesJson
        },
        tests: {
            coversRootPath: 'testscovers',
            defaultCoverFile: 'cover.webp',
            games: testsJson
        }
    };

    for (const [folderKey, store] of Object.entries(all_games)) {
        const directory = resolve(
            __dirname,
            '..',
            'public',
            store.coversRootPath
        );

        for (const game of store.games) {
            const gameId = `${game.playlistId || game.videoId}`;

            const gameIcon = resolve(
                directory,
                gameId,
                game.coverFile || store.defaultCoverFile
            );

            try {
                await resizePicture(directory, gameId, gameIcon);
                console.log(`${game.title} - finished`);
            } catch (error) {
                console.error(
                    `${folderKey} - Cannot generate responsive images for ${gameId} - ${game.title}`
                );
                console.error(error);
            }
        }
    }
}

async function resizePicturesInSingleFolder(
    folder: string,
    game: string,
    icon: string
): Promise<void> {
    const directory = resolve(
        __dirname,
        '..',
        'public',
        folder
    );

    const gameIcon = resolve(directory, game, icon);

    try {
        await resizePicture(directory, game, gameIcon);
        console.log(`${game} - finished`);
    } catch (error) {
        console.error(
            `Cannot generate responsive images for ${game}`
        );
        console.error(error);
    }
}

const args = process.argv.slice(2);

switch (args[0]) {
    case 'singleGame': {
        console.log('Resize single game');

        const [, gameId, folder = 'covers', icon = 'cover.jpg'] = args;

        if (!gameId) {
            console.error(
                'Error: gameId is required for singleGame mode.'
            );
            break;
        }

        await resizePicturesInSingleFolder(folder, gameId, icon);
        break;
    }

    default:
        console.log('Resize all pictures ....');
        await resizePicturesInFolder();
}

import sharp from 'sharp';
import { createReadStream } from 'fs';
import { readFile } from 'fs/promises';
import { normalize, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = fileURLToPath(dirname(import.meta.url));

const testsJson = JSON.parse(
    await readFile(
        resolve(
            __dirname,
            './src/app/api/tests/tests.json'
        )
    )
);
const gamesJson = JSON.parse(
    await readFile(
        resolve(
            __dirname,
            './src/app/api/games/games.json'
        )
    )
);

// Get-ChildItem *@*.webp -Recurse | foreach { Remove-Item -Path $_.FullName }
async function resizePicture(directory, gameId, pathIcon) {
    const sharpStream = sharp({ failOn: 'none' });
    const readableStream = createReadStream(pathIcon);

    // set up pipe
    readableStream.pipe(sharpStream)

    const promises = [];
    const config = [
        // generate small picture
        {
            width: 150, 
            height: 150,
            suffix: "small"
        },
        // generate medium picture
        {
            width: 200, 
            height: 200,
            suffix: "medium"
        },
        // generate big picture
        {
            width: 250, 
            height: 250,
            suffix: "big"
        },
    ]

    for(let setting of config) {
        promises.push(
            sharpStream
              .clone()
              .resize({ width: setting.width, height: setting.height, fit: "inside" })
              .toFile(`${directory}/${gameId}/cover@${setting.suffix}.webp`)
        );
    }

    return await Promise.all(promises);
}

// For big bang pictures refactoring
async function resizePicturesInFolder() {

    const all_games = {
        games: {
            coversRootPath: "covers",
            defaultCoverFile: "cover.webp",
            games: gamesJson
        },
        tests: {
            coversRootPath: "testscovers",
            defaultCoverFile: "cover.webp",
            games: testsJson
        }
    }

    for (let [folderKey, store] of Object.entries(all_games)) {
        let directory = normalize(`${__dirname}/public/${ store.coversRootPath }`);
        for(let game of store.games) {
            const gameId = `${game.playlistId || game.videoId}`
            let gameIcon = `${directory}/${gameId}/${ game.coverFile || store.defaultCoverFile }`
            try {
                await resizePicture(directory, gameId, gameIcon);
                console.log(`${game.title} - finished`);
            } catch (error) {
                console.error(`${folderKey} - Cannot generate responsive images for ${gameId} - ${game.title}`);
            }
        }
    }
}

// For new game / test entry
async function resizePicturesInSingleFolder(folder, game, icon) {
    let directory = normalize(`${__dirname}/public/${ folder }`);
    let gameIcon = `${directory}/${game}/${ icon }`
    try {
        await resizePicture(directory, game, gameIcon);
        console.log(`${game} - finished`);
    } catch (error) {
        console.error(`Cannot generate responsive images for ${game}`);
    }
}

// Main
const args = process.argv.slice(2);
switch (args[0]) {
    case 'singleGame':
        console.log("Resize single game");
        const [_, gameId, folder = "covers", icon = "cover.jpg", ...rest] = args;
        resizePicturesInSingleFolder(folder, gameId, icon);
        break;
    default:
        console.log("Resize all pictures ....");
        resizePicturesInFolder();
}
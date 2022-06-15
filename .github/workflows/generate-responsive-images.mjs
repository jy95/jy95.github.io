import sharp from 'sharp';
import { createReadStream } from 'fs';
import { readFile } from 'fs/promises';
import { normalize, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = fileURLToPath(dirname(import.meta.url));

const testsJson = JSON.parse(
    await readFile(
      new URL('../../src/data/tests.json', import.meta.url)
    )
);
const gamesJson = JSON.parse(
    await readFile(
      new URL('../../src/data/games.json', import.meta.url)
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
            width: 97, 
            height: 97,
            suffix: "small"
        },
        // generate medium picture
        {
            width: 150, 
            height: 150,
            suffix: "medium"
        },
        // generate big picture
        {
            width: 200, 
            height: 200,
            suffix: "big"
        },
    ]

    for(let setting of config) {
        promises.push(
            sharpStream
              .clone()
              .resize({ width: setting.width, height: setting.height, fit: "fill" })
              .toFile(`${directory}/${gameId}/cover@${setting.suffix}.webp`)
        );
    }

    return await Promise.all(promises);
}

async function resizePicturesInFolder() {
    for (let folder of [gamesJson, testsJson]) {
        let directory = normalize(`${__dirname}/../../public/${ folder.coversRootPath }`);
        for(let game of folder.games) {
            const gameId = `${game.playlistId || game.videoId}`
            let gameIcon = `${directory}/${gameId}/${ game.coverFile || folder.defaultCoverFile }`
            try {
                await resizePicture(directory, gameId, gameIcon);
                console.log(`${game.title} - finished`);
            } catch (error) {
                console.error(`Cannot generate responsive images for ${gameId} - ${game.title}`);
            }
        }
    }
}

resizePicturesInFolder();

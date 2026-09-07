import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { closeBrowser, imageSearch } from 'imgsearch-api';

const __dirname: string = path.dirname(fileURLToPath(import.meta.url));

// --- CONFIGURATION ---

const JSON_FILE: string = path.resolve(
    __dirname,
    '..',
    'src/app/api/backlog/backlog.json'
);

const OUTPUT_ROOT: string = path.resolve(
    __dirname,
    '..',
    'public/backlogcovers'
);

// --- TYPES ---

interface Game {
    id: number | string;
    title: string;
    platform: number;
}

// --- PLATFORMS ---

const PLATFORMS_MAP: Record<number, string> = {
    1: 'PC',
    2: 'GBA',
    3: 'PSP',
    4: 'PS1',
    5: 'PS2',
    6: 'PS3',
    7: 'SCUMMVM'
};

// --- IMAGE MIME TYPES ---

const MIME_MAP: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif'
};

/**
 * Download an image and save it as the game's cover.
 */
export async function downloadImage(
    url: string,
    gameId: number | string
): Promise<string | null> {
    const gameDir: string = path.join(
        OUTPUT_ROOT,
        String(gameId)
    );

    if (!fs.existsSync(gameDir)) {
        fs.mkdirSync(gameDir, { recursive: true });
    }

    const controller = new AbortController();

    const timeoutId = setTimeout(
        () => controller.abort(),
        10000
    );

    try {
        const response = await fetch(url, {
            method: 'GET',
            signal: controller.signal,
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                    'Chrome/120.0.0.0 Safari/537.36'
            }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(
                `HTTP error! status: ${response.status}`
            );
        }

        const contentType: string = (
            response.headers.get('content-type') || ''
        )
            .split(';')[0]
            .trim()
            .toLowerCase();

        const extension: string =
            MIME_MAP[contentType] || 'jpg';

        const fileName: string = `cover.${extension}`;
        const filePath: string = path.join(
            gameDir,
            fileName
        );
        const tmpPath: string = `${filePath}.tmp`;

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Write to a temporary file first, then rename it.
        fs.writeFileSync(tmpPath, buffer);
        fs.renameSync(tmpPath, filePath);

        return fileName;
    } catch (error: unknown) {
        clearTimeout(timeoutId);

        const fileName = 'cover.jpg';
        const tmpPath = path.join(
            gameDir,
            `${fileName}.tmp`
        );

        if (fs.existsSync(tmpPath)) {
            fs.unlinkSync(tmpPath);
        }

        if (
            error instanceof Error &&
            error.name === 'AbortError'
        ) {
            console.error(
                '      ❌ Erreur de téléchargement : Le délai d’attente (timeout) a expiré'
            );
        } else {
            console.error(
                `      ❌ Erreur de téléchargement : ${
                    error instanceof Error
                        ? error.message
                        : String(error)
                }`
            );
        }

        return null;
    }
}

/**
 * Search for images using imgsearch-api.
 *
 * Bing is used first because imgsearch-api reports that it provides
 * full-size original URLs. DuckDuckGo is used as a fallback.
 */
async function searchImage(
    query: string
): Promise<string | null> {
    const results = await imageSearch(query, {
        engines: ['bing', 'ddg'],
        n: 5
    });

    return results[0] ?? null;
}

export async function run(): Promise<void> {
    let games: Game[];

    try {
        const rawData: string = fs.readFileSync(
            JSON_FILE,
            'utf-8'
        );

        games = JSON.parse(rawData);
    } catch (error) {
        console.error(
            '❌ Impossible de lire le fichier backlog.json'
        );

        throw error;
    }

    console.log(
        `🚀 Lancement de la récupération pour ${games.length} titres...`
    );

    try {
        for (const game of games) {
            const platformName: string =
                PLATFORMS_MAP[game.platform] || '';

            const query: string =
                `${game.title} ${platformName} official box art`.trim();

            const gameDir: string = path.join(
                OUTPUT_ROOT,
                String(game.id)
            );

            // Skip games that already have a cover.
            const existingFiles: string[] =
                fs.existsSync(gameDir)
                    ? fs.readdirSync(gameDir)
                    : [];

            if (
                existingFiles.some(
                    (file: string) =>
                        file.startsWith('cover.')
                )
            ) {
                console.log(
                    `⏩ [${game.id}] ${game.title} (Déjà présent)`
                );

                continue;
            }

            console.log(
                `🔍 Recherche : "${query}"`
            );

            try {
                const imageUrl =
                    await searchImage(query);

                if (imageUrl) {
                    console.log(
                        `    🔗 Image trouvée : ${imageUrl}`
                    );

                    const savedName =
                        await downloadImage(
                            imageUrl,
                            game.id
                        );

                    if (savedName) {
                        console.log(
                            `    ✅ Sauvegardé : ${game.id}/${savedName}`
                        );
                    }
                } else {
                    console.log(
                        `    ⚠️ Aucune image trouvée pour : ${game.title} (${game.id})`
                    );
                }
            } catch (error: unknown) {
                console.error(
                    `    ❌ Erreur lors de la recherche : ${
                        error instanceof Error
                            ? error.message
                            : String(error)
                    }`
                );
            }

            // Avoid hammering image search engines.
            await new Promise<void>(
                (resolve) => setTimeout(resolve, 2000)
            );
        }
    } finally {
        // imgsearch-api keeps a browser singleton alive between searches.
        await closeBrowser();
    }

    console.log('\n✨ Terminé !');
}

await run();

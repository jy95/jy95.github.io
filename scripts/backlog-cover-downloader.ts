import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Bing } from 'bing-image-downloader';

const __dirname: string = path.dirname(fileURLToPath(import.meta.url));

// --- CONFIGURATION ---
const JSON_FILE: string = path.resolve(__dirname, '..', 'src/app/api/backlog/backlog.json');
const OUTPUT_ROOT: string = path.resolve(__dirname, '..', 'public/backlogcovers');

// Définition de l'interface pour un jeu
interface Game {
    id: number | string;
    title: string;
    platform: number;
}

const PLATFORMS_MAP: Record<number, string> = {
    1: 'PC',
    2: 'GBA',
    3: 'PSP',
    4: 'PS1',
    5: 'PS2',
    6: 'PS3',
    7: 'SCUMMVM'
};

/**
 * Mappe le Content-Type vers une extension de fichier
 */
const MIME_MAP: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif'
};

export async function downloadImage(url: string, gameId: number | string): Promise<string | null> {
    const gameDir: string = path.join(OUTPUT_ROOT, String(gameId));

    if (!fs.existsSync(gameDir)) {
        fs.mkdirSync(gameDir, { recursive: true });
    }

    // AbortController pour gérer le timeout de 10 secondes avec fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
        const response = await fetch(url, {
            method: 'GET',
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Détection de l'extension via le Content-Type
        const contentType: string = (response.headers.get('content-type') || '')
            .split(';')[0]
            .trim()
            .toLowerCase();
        const extension: string = MIME_MAP[contentType] || 'jpg'; // jpg par défaut si inconnu
        const fileName: string = `cover.${extension}`;
        const filePath: string = path.join(gameDir, fileName);
        const tmpPath: string = `${filePath}.tmp`;

        // Récupération des données binaires
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Écriture sécurisée (fichier temporaire puis renommage)
        fs.writeFileSync(tmpPath, buffer);
        fs.renameSync(tmpPath, filePath);

        return fileName;
    } catch (error: any) {
        clearTimeout(timeoutId);

        // Nettoyage du fichier temporaire si l'erreur survient pendant l'écriture
        const fileName: string = `cover.jpg`; // Fallback de nom pour le chemin de nettoyage au cas où
        const tmpPath: string = path.join(gameDir, `${fileName}.tmp`);
        if (fs.existsSync(tmpPath)) {
            fs.unlinkSync(tmpPath);
        }

        console.error(`Error downloading image for game ${gameId}:`, error.message);
        return null;
    }
}

/**
 * Recherche et télécharge une image de couverture pour un jeu
 */
export async function searchAndDownloadCover(game: Game): Promise<boolean> {
    try {
        const searchQuery: string = `${game.title} ${PLATFORMS_MAP[game.platform] || ''} game cover`;
        console.log(`Searching cover for: ${searchQuery}`);

        const bing = new Bing();
        const results = await bing.download({
            query: searchQuery,
            limit: 1,
            detailed_results: false,
            force_replace: false,
            timeout: 60,
            adult_filter_off: false,
            force_replace_all: false,
            silent: true
        });

        if (results && results.length > 0) {
            const imageUrl: string = results[0];
            const result = await downloadImage(imageUrl, game.id);
            return result !== null;
        }

        return false;
    } catch (error: any) {
        console.error(`Error searching cover for game ${game.id}:`, error.message);
        return false;
    }
}

/**
 * Fonction principale
 */
export async function run(): Promise<void> {
    try {
        if (!fs.existsSync(JSON_FILE)) {
            console.log('Backlog file not found at:', JSON_FILE);
            return;
        }

        const data: string = fs.readFileSync(JSON_FILE, 'utf-8');
        const games: Game[] = JSON.parse(data);

        console.log(`Found ${games.length} games in backlog`);

        let downloaded: number = 0;

        for (const game of games) {
            const gameDir: string = path.join(OUTPUT_ROOT, String(game.id));
            const coverExists: boolean = fs.existsSync(gameDir) &&
                fs.readdirSync(gameDir).some(file => file.startsWith('cover.'));

            if (!coverExists) {
                const success: boolean = await searchAndDownloadCover(game);
                if (success) {
                    downloaded++;
                    console.log(`✓ Downloaded cover for: ${game.title}`);
                } else {
                    console.log(`✗ Failed to download cover for: ${game.title}`);
                }
                // Petit délai pour éviter de surcharger le serveur
                await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
                console.log(`⊘ Cover already exists for: ${game.title}`);
            }
        }

        console.log(`\nDownload complete: ${downloaded} new covers`);
    } catch (error: any) {
        console.error('Error running downloader:', error);
    }
}

// Run the script if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
    run().catch(console.error);
}

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GOOGLE_IMG_SCRAP } from 'google-img-scrap';

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
    6: 'PS3'
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

async function downloadImage(url: string, gameId: number | string): Promise<string | null> {
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

        if (error.name === 'AbortError') {
            console.error(`      ❌ Erreur de téléchargement : Le délai d'attente (timeout) a expiré`);
        } else {
            console.error(`      ❌ Erreur de téléchargement : ${error.message}`);
        }
        return null;
    }
}

async function run(): Promise<void> {
    let games: Game[];
    try {
        const rawData: string = fs.readFileSync(JSON_FILE, 'utf-8');
        games = JSON.parse(rawData);
    } catch (err) {
        console.error("❌ Impossible de lire le fichier backlog.json");
        return;
    }

    console.log(`🚀 Lancement de la récupération pour ${games.length} titres...`);

    for (const game of games) {
        const platformName: string = PLATFORMS_MAP[game.platform] || "";
        const query: string = `${game.title} ${platformName} official box art`.trim();
        const gameDir: string = path.join(OUTPUT_ROOT, String(game.id));

        // Vérification si une image existe déjà (peu importe l'extension)
        const existingFiles: string[] = fs.existsSync(gameDir) ? fs.readdirSync(gameDir) : [];
        if (existingFiles.some((file: string) => file.startsWith('cover.'))) {
            console.log(`⏩ [${game.id}] ${game.title} (Déjà présent)`);
            continue;
        }

        console.log(`🔍 Recherche : "${query}"`);

        try {
            const request = await GOOGLE_IMG_SCRAP({
                search: query,
                limit: 5
            });

            const results = request.result;

            if (results && results.length > 0) {
                const imageUrl: string = results[0].url;
                console.log(`    🔗 Image trouvée : ${imageUrl}`);

                const savedName: string | null = await downloadImage(imageUrl, game.id);
                if (savedName) {
                    console.log(`    ✅ Sauvegardé : ${game.id}/${savedName}`);
                }
            } else {
                console.log(`    ⚠️ Aucune image trouvée pour : ${game.title}`);
            }
        } catch (err: any) {
            console.error(`    ❌ Erreur lors de la recherche : ${err.message}`);
        }

        await new Promise<void>(resolve => setTimeout(resolve, 2000));
    }

    console.log("\n✨ Terminé !");
}

(async () => {
    await run();
})();
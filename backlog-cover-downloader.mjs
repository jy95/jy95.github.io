import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { googleImg } from 'google-img-scrap';

// --- CONFIGURATION ---
const JSON_FILE = './src/app/api/backlog/backlog.json';
const OUTPUT_ROOT = './public/backlogcovers';

const PLATFORMS_MAP = {
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
const MIME_MAP = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif'
};

async function downloadImage(url, gameId) {
    const gameDir = path.join(OUTPUT_ROOT, String(gameId));
    
    if (!fs.existsSync(gameDir)) {
        fs.mkdirSync(gameDir, { recursive: true });
    }

    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
            timeout: 10000,
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
            }
        });

        // Détection de l'extension via le Content-Type
        const contentType = (response.headers['content-type'] || '')
            .split(';')[0]
            .trim()
            .toLowerCase();
        const extension = MIME_MAP[contentType] || 'jpg'; // jpg par défaut si inconnu
        const fileName = `cover.${extension}`;
        const filePath = path.join(gameDir, fileName);

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(fileName));
            writer.on('error', reject);
        });
    } catch (error) {
        console.error(`      ❌ Erreur de téléchargement : ${error.message}`);
        return null;
    }
}

async function run() {
    let games;
    try {
        const rawData = fs.readFileSync(JSON_FILE, 'utf-8');
        games = JSON.parse(rawData);
    } catch (err) {
        console.error("❌ Impossible de lire le fichier backlog.json");
        return;
    }

    console.log(`🚀 Lancement de la récupération pour ${games.length} titres...`);

    for (const game of games) {
        const platformName = PLATFORMS_MAP[game.platform] || "";
        const query = `${game.title} ${platformName} official box art`.trim();
        const gameDir = path.join(OUTPUT_ROOT, String(game.id));

        // Vérification si une image existe déjà (peu importe l'extension)
        const existingFiles = fs.existsSync(gameDir) ? fs.readdirSync(gameDir) : [];
        if (existingFiles.some(file => file.startsWith('cover.'))) {
            console.log(`⏩ [${game.id}] ${game.title} (Déjà présent)`);
            continue;
        }

        console.log(`🔍 Recherche : "${query}"`);

        try {
            const results = await googleImg(query);

            if (results && results.length > 0) {
                const imageUrl = results[0].url;
                console.log(`   🔗 Image trouvée : ${imageUrl.substring(0, 50)}...`);
                
                const savedName = await downloadImage(imageUrl, game.id);
                if (savedName) {
                    console.log(`   ✅ Sauvegardé : ${game.id}/${savedName}`);
                }
            } else {
                console.log(`   ⚠️ Aucune image trouvée pour : ${game.title}`);
            }
        } catch (err) {
            console.error(`   ❌ Erreur lors de la recherche : ${err.message}`);
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log("\n✨ Terminé !");
}

await run();
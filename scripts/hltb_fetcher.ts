import Database from 'better-sqlite3';
import { HowLongToBeatService } from 'howlongtobeat-ts';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Define structures for our database records
interface GameRow {
    id: number;
    title: string;
}

const CONFIG = {
    DELAY_MIN_MS: 500,  // Pause minimale en millisecondes
    DELAY_MAX_MS: 1000, // Pause maximale en millisecondes
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const databasePath = resolve(__dirname, '..', 'GamesPassionFR.db');
const db = new Database(databasePath, { verbose: console.log });
const hltbService = new HowLongToBeatService();

/**
 * Transforme le temps HLTB (secondes) en format "HH:mm:ss"
 * @param {number} totalSeconds 
 * @returns {string | null}
 */
function toDuration(totalSeconds: number | undefined): string | null {
    // If the time is not available or zero, return null as 00:00:00 is not meaningful
    if (!totalSeconds || totalSeconds <= 0) return null;

    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');

    return `${h}:${m}:${s}`;
}

async function syncBacklog(): Promise<void> {
    // 1. On récupère les jeux qui n'ont pas encore de données HLTB
    const games = db.prepare("SELECT id, title FROM backlog WHERE hltb_main IS NULL").all() as GameRow[];

    console.log(`🔍 Analyse de ${games.length} jeux...`);

    for (const game of games) {
        try {
            console.log(`\nRecherche pour : ${game.title}...`);
            const results = await hltbService.search(game.title);

            if ( results.success ) {
                // On prend le résultat le plus pertinent (le premier)
                const data = results.data[0];

                const main = toDuration(data.mainTime);
                const extra = toDuration(data.mainExtraTime);
                const comp = toDuration(data.completionistTime);

                // 2. Mise à jour immédiate en DB
                const update = db.prepare(`
                    UPDATE backlog 
                    SET hltb_main = ?, 
                        hltb_extra = ?, 
                        hltb_completionist = ?
                    WHERE id = ?
                `);

                update.run(main, extra, comp, game.id);
                console.log(`✅ Mis à jour : ${game.title} (Main: ${main})`);
            } else {
                console.log(`⚠️ Aucun résultat trouvé pour ${game.title} (${game.id})`);
            }

            // Petite pause pour éviter de se faire bannir par HLTB si tu as 500 jeux
            const randomDelay = Math.floor(Math.random() * (CONFIG.DELAY_MAX_MS - CONFIG.DELAY_MIN_MS + 1)) + CONFIG.DELAY_MIN_MS;
            console.log(`⏳ Pause de ${randomDelay} ms...`);
            await new Promise<void>(resolve => setTimeout(resolve, randomDelay));

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`❌ Erreur sur ${game.title} (${game.id}):`, errorMessage);
        }
    }

    console.log("\n✨ Synchronisation terminée !");
    db.close();
}

await syncBacklog();
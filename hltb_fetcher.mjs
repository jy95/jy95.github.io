import Database from 'better-sqlite3';
import { HowLongToBeatService, SearchModifier } from 'howlongtobeat-ts';

const databasePath = 'GamesPassionFR.db';
const db = new Database(databasePath, { verbose: console.log });
const hltbService = new HowLongToBeatService();

/**
 * Transforme le temps HLTB (secondes) en format "HH:mm:ss"
 * @param {number} totalSeconds 
 * @returns {string}
 */
function toDuration(totalSeconds) {
    if (!totalSeconds || totalSeconds <= 0) return "00:00:00";

    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');

    return `${h}:${m}:${s}`;
}

async function syncBacklog() {
    // 1. On récupère les jeux qui n'ont pas encore de données HLTB
    const games = db.prepare("SELECT id, title FROM backlog WHERE hltb_main IS NULL").all();

    console.log(`🔍 Analyse de ${games.length} jeux...`);

    for (const game of games) {
        try {
            console.log(`\nRecherche pour : ${game.title}...`);
            const results = await hltbService.search(game.title);

            if (results && results.length > 0) {
                // On prend le résultat le plus pertinent (le premier)
                const data = results[0];

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
                console.log(`⚠️ Aucun résultat trouvé pour ${game.title}`);
            }

            // Petite pause pour éviter de se faire bannir par HLTB si tu as 500 jeux
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
            console.error(`❌ Erreur sur ${game.title}:`, error.message);
        }
    }

    console.log("\n✨ Synchronisation terminée !");
    db.close();
}

syncBacklog();
import { HowLongToBeatService } from 'howlongtobeat-ts';
import { openDatabase } from './common/db';
import { randomDelay, sleep } from './common/delay';

interface GameRow {
    id: number;
    title: string;
}

const CONFIG = {
    DELAY_MIN_MS: 500,  // Pause minimale en millisecondes
    DELAY_MAX_MS: 1000, // Pause maximale en millisecondes
};

const db = openDatabase();
const hltbService = new HowLongToBeatService();

const updateDurations = db.prepare(`
    UPDATE backlog
    SET hltb_main = ?,
        hltb_extra = ?,
        hltb_completionist = ?
    WHERE id = ?
`);

const pad = (value: number): string => String(Math.floor(value)).padStart(2, '0');

/**
 * Transforme le temps HLTB (secondes) en format "HH:mm:ss"
 * Retourne null si le temps est absent ou nul ("00:00:00" n'a pas de sens).
 */
function toDuration(totalSeconds: number | undefined): string | null {
    if (!totalSeconds || totalSeconds <= 0) return null;

    return [totalSeconds / 3600, (totalSeconds % 3600) / 60, totalSeconds % 60]
        .map(pad)
        .join(':');
}

async function syncGame(game: GameRow): Promise<void> {
    console.log(`\nRecherche pour : ${game.title}...`);
    const result = await hltbService.searchOne(game.title);

    if (!result.success || !result.data) {
        console.log(`⚠️ Aucun résultat trouvé pour ${game.title} (${game.id})`);
        return;
    }

    const { mainTime, mainExtraTime, completionistTime } = result.data;
    const main = toDuration(mainTime);

    updateDurations.run(main, toDuration(mainExtraTime), toDuration(completionistTime), game.id);
    console.log(`✅ Mis à jour : ${game.title} (Main: ${main})`);
}

async function pauseBetweenRequests(): Promise<void> {
    // Évite de se faire bannir par HLTB si tu as 500 jeux
    const delay = randomDelay(CONFIG.DELAY_MIN_MS, CONFIG.DELAY_MAX_MS);
    console.log(`⏳ Pause de ${delay} ms...`);
    await sleep(delay);
}

async function syncBacklog(): Promise<void> {
    // On récupère les jeux qui n'ont pas encore de données HLTB
    const games = db.prepare("SELECT id, title FROM backlog WHERE hltb_main IS NULL").all() as GameRow[];

    console.log(`🔍 Analyse de ${games.length} jeux...`);

    for (const game of games) {
        try {
            await syncGame(game);
            await pauseBetweenRequests();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`❌ Erreur sur ${game.title} (${game.id}):`, errorMessage);
        }
    }

    console.log("\n✨ Synchronisation terminée !");
}

try {
    await syncBacklog();
} finally {
    db.close();
}

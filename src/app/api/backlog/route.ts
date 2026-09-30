import { cachedJson } from "@/lib/http/cachedJson";
import { loadBacklogGames, toBacklogEntry } from "@/lib/gamesData";
import type { RawBacklogEntry } from "@/lib/gamesData";

export type { BacklogEntry } from "@/domain/games/details";
export type RawPayload = RawBacklogEntry[];

export async function GET() {
    const gamesData = await loadBacklogGames();
    const games = gamesData.map(toBacklogEntry);

    return cachedJson(games);
}

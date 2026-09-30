import { cachedJson } from "@/lib/http/cachedJson";
import { loadPlanningGames, toPlanningEntry } from "@/lib/gamesData";

export type { PlanningEntry as planningEntry } from "@/domain/games/details";

export async function GET() {
    const games = await loadPlanningGames();

    return cachedJson(games.map(toPlanningEntry));
}

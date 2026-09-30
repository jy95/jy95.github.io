import { NextResponse } from "next/server";
import { loadPlanningGames, toPlanningEntry } from "@/lib/gamesData";

export type { PlanningEntry as planningEntry } from "@/domain/games/details";

export async function GET() {
    const games = await loadPlanningGames();

    return NextResponse.json(games.map(toPlanningEntry), {
        headers: {
            "Cache-Control": "public, max-age=86400, must-revalidate"
        }
    });
}

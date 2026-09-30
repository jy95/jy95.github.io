import { NextResponse } from "next/server";
import { extractGameCardProps } from "@/domain/games";
import type { GameDetailsResponse } from "@/domain/games/details";
import {
    loadPublishedGames, loadDlcGroups, loadPlanningGames, loadBacklogGames,
    toPublishedGame, toPlanningEntry, toBacklogEntry,
} from "@/lib/gamesData";
import { cachedJson } from "@/lib/http/cachedJson";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const published = (await loadPublishedGames()).find((game) => extractGameCardProps(game).id === id);
    if (published) {
        return cachedJson<GameDetailsResponse>({ source: "published", game: toPublishedGame(published) });
    }

    const dlc = (await loadDlcGroups()).flatMap((group) => group.dlcs)
        .find((game) => extractGameCardProps(game).id === id);
    if (dlc) {
        return cachedJson<GameDetailsResponse>({ source: "published", game: toPublishedGame(dlc) });
    }

    const planning = (await loadPlanningGames()).find((game) => extractGameCardProps(game).id === id);
    if (planning) {
        return cachedJson<GameDetailsResponse>({ source: "planning", game: toPlanningEntry(planning) });
    }

    const backlog = (await loadBacklogGames()).find((game) => game.id.toString() === id);
    if (backlog) {
        return cachedJson<GameDetailsResponse>({ source: "backlog", game: toBacklogEntry(backlog) });
    }

    return NextResponse.json({ error: "Game not found" }, { status: 404 });
}

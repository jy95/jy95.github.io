import { NextResponse } from "next/server";
import { buildCardEntry } from "@/redux/sharedDefintion";
import type { BasicGame, CardGame } from "@/redux/sharedDefintion";

export type TestsResponse = {
    items: CardGame[],
    total_items: number,
    limit: number,
    offset: number
}

type rawEntry = Omit<BasicGame, "id" | "genres">
export type RawPayload = rawEntry[];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const gamesData = (await import("./tests.json")).default;

    const limit = searchParams.has("limit") ? parseInt(searchParams.get("limit")!) : -1;
    const offset = searchParams.has("offset") ? parseInt(searchParams.get("offset")!) : 0;
    const games = (limit === -1) ? gamesData : gamesData.slice(offset, limit);

    return NextResponse.json({
        items: games.map(enhanceGameItem),
        total_items: gamesData.length,
        limit,
        offset
    }, {
        headers: {
            "Cache-Control": "public, max-age=86400, must-revalidate"
        }
    });
}

function enhanceGameItem(game: rawEntry): CardGame {
    return {
        ...game,
        ...buildCardEntry(game, "/testscovers", "test")
    };
}

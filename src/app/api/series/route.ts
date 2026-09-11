import { NextResponse } from "next/server";
import { buildCardEntry } from "@/domain/games";
import type { RawGame, CardGame } from "@/domain/games";

type rawEntry = {
    /** @description Unique identifier of the game */
    id: number,
    /** @description Name of the series */
    name: string;
    /** @description List of videoId or playlistId for this series */
    items: RawGame[]
}
export type RawPayload = rawEntry[];

export type serieType = {
    id: number,
    name: string,
    items: CardGame[]
};

export async function GET() {
    const seriesData = (await import("./series.json")).default;

    const series: serieType[] = seriesData.map(serie => ({
        id: serie.id,
        name: serie.name,
        items: fromRawGamesToCardGames(serie.items as RawGame[])
    }));

    return NextResponse.json(series, {
        headers: {
            "Cache-Control": "public, max-age=86400, must-revalidate"
        }
    });
}

function fromRawGamesToCardGames(gamesData: RawGame[]): CardGame[] {
    return gamesData.map(game => ({
        ...game,
        ...buildCardEntry(game, "/covers")
    }));
}

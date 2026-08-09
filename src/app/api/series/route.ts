import { NextResponse } from "next/server";
import { buildCardEntry } from "@/redux/sharedDefintion";
import type { RawGame, CardGame } from "@/redux/sharedDefintion";

type rawEntry = {
    /** @description Name of the series */
    name: string;
    /** @description List of videoId or playlistId for this series */
    items: RawGame[]
}
export type RawPayload = rawEntry[];

export type serieType = {
    name: string,
    items: CardGame[]
};

export async function GET() {
    const seriesData = (await import("./series.json")).default;

    const series: serieType[] = seriesData.map(serie => ({
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
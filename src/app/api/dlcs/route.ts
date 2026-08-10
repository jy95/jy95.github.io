import { NextResponse } from "next/server";
import { buildCardEntry } from "@/redux/sharedDefintion";
import type { RawGame, CardGame } from "@/redux/sharedDefintion";

type rawEntry = {
    /** @description Name of the game */
    name: string;
    /** @description List of dlc for this game */
    items: RawGame[]
}
export type RawPayload = rawEntry[];

export type dlcType = {
    name: string,
    items: CardGame[]
};

export async function GET() {
    const dlcsData = (await import("./dlcs.json")).default;

    const dlcs: dlcType[] = dlcsData.map((dlc) => ({
        name: dlc.game_title,
        items: fromRawGamesToCardGames(dlc.dlcs as RawGame[])
    }));

    return NextResponse.json(dlcs, {
        headers: {
            "Cache-Control": "public, max-age=86400, must-revalidate"
        }
    });
}

function fromRawGamesToCardGames(gamesData: RawGame[]): CardGame[] {
    return gamesData.map(game => ({
        ...game,
        ...buildCardEntry(game, "/covers", "dlc")
    }));
}

import { NextResponse } from "next/server";
import type { BasicGame, CardGame, YTUrlType } from "@/redux/sharedDefintion";

type rawGame = Omit<BasicGame, "genres" | "id">;
type rawEntry = {
    /** @description Name of the game */
    name: string;
    /** @description List of dlc for this game */
    items: rawGame[]
}
export type RawPayload = rawEntry[];

export type dlcType = {
    name: string,
    items: CardGame[]
};

export async function GET() {

    // Fetch dlcs data
    const dlcsData = (await import("./dlcs.json")).default;

    const dlcs : dlcType[] = dlcsData.map(dlc => ({
        name: dlc.game_title,
        items: fromRawGamesToCardGames(dlc.dlcs as rawGame[])
    }) )
    
    return NextResponse.json(dlcs, {
        headers: {
            "Cache-Control": "public, max-age=86400, must-revalidate"
        }
    });
}

function fromRawGamesToCardGames(gamesData : rawGame[]) : CardGame[]{

    return gamesData
        .map(game => {

            const id = (game as any).playlistId as string ?? (game as any).videoId as string;
            const base_url = (
                ("playlistId" in game) 
                    ? "https://www.youtube.com/playlist?list=" 
                    :  "https://www.youtube.com/watch?v="
            ) + id ;
    
            return {
                ...game,
                id,
                genres: [],
                imagePath: `/covers/${id}/cover.webp`,
                url: base_url,
                url_type: ("playlistId" in game) ? "PLAYLIST" : "VIDEO" as YTUrlType,
            }
        });
}
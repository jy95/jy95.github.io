import { NextResponse } from "next/server";
import type { BasicVideo, CardGame, YTUrlType } from "@/redux/sharedDefintion";

type rawGame = Omit<BasicVideo, "genres" | "id">;
type rawEntry = {
    /** @description Name of the series */
    name: string;
    /** @description List of videoId or playlistId for this series */
    items: rawGame[]
}
export type RawPayload = rawEntry[];

export type serieType = {
    name: string,
    items: CardGame[]
};

export async function GET() {

    // Fetch series data
    const seriesData = (await import("./series.json")).default;

    const series : serieType[] = seriesData.map(serie => ({
        name: serie.name,
        items: fromRawGamesToCardGames(serie.items as rawGame[])
    }) )
    
    return NextResponse.json(series, {
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
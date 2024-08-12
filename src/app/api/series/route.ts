import { NextResponse } from "next/server";
import type { BasicGame, BasicPlaylist, BasicVideo, CardGame, YTUrlType } from "@/redux/sharedDefintion";

export type serieType = {
    name: string,
    items: CardGame[]
};

type rawEntry = {
    /** @description Name of the series */
    name: string;
    /** @description List of videoId or playlistId for this series */
    games: BasicVideo[]
}
export type RawPayload = rawEntry[];

export async function GET() {

    // Fetch series data
    const seriesData = (await import("./series.json")).default as RawPayload;

    const series : serieType[] = seriesData.map(serie => ({
        name: serie.name,
        items: fromRawGamesToCardGames(serie.games)
    }) )
    
    return NextResponse.json(series, {
        headers: {
            "Cache-Control": "public, max-age=86400, must-revalidate"
        }
    });
}

function fromRawGamesToCardGames(gamesData : BasicGame[]) : CardGame[]{

    return gamesData
        .map(game => {

            const id = (game as BasicPlaylist).playlistId ?? (game as BasicVideo).videoId;
            const base_url = (
                ("playlistId" in game) 
                    ? "https://www.youtube.com/playlist?list=" 
                    :  "https://www.youtube.com/watch?v="
            ) + id ;
    
            return {
                ...game,
                id,
                imagePath: `/covers/${id}/${ game?.coverFile ?? "cover.webp" }`,
                url: base_url,
                url_type: ("playlistId" in game) ? "PLAYLIST" : "VIDEO" as YTUrlType,
                releaseDate: game.releaseDate
                    .split("/")
                    .reduce( (acc : number, curr : string, idx : number) => acc + (parseInt(curr) * Math.pow(100, idx)), 0),
                durationAsInt: (game.duration)
                    ? Number(game.duration.replaceAll(":", ""))
                    : 0
            }
        });
}
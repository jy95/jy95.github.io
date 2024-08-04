import { NextResponse } from "next/server";
import type { BasicGame, BasicPlaylist, BasicVideo, EnhancedGame, YTUrlType } from "@/redux/sharedDefintion";

export type serieType = {
    name: string,
    items: EnhancedGame[]
};

type rawEntry = {
    /** @description Name of the series */
    name: string;
    /** @description List of videoId or playlistId for this series */
    games: string[]
}
export type RawPayload = rawEntry[];

export async function GET(request: Request) {

    // Get query parameters
    const { searchParams } = new URL(request.url);

    // Get wanted date
    const dateAsInteger = parseInt( searchParams.get("dateAsInteger") || "0");

    // Fetch games data
    const gamesData = (await import("@/app/api/games/games.json")).default;
    const games = generateGamesResponse(gamesData as BasicGame[], dateAsInteger)

    // Fetch series data
    const seriesData = (await import("./series.json")).default;

    // Convert array to { "id": Game }
    let games_dictionary = games
        .reduce( (acc : {[id: string]: EnhancedGame}, game : EnhancedGame) => {
            acc[game.id] = game;
            return acc;
        }, {})
    
    const sortByNameASC = (a : serieType, b : serieType) => new Intl.Collator().compare(a.name, b.name);

    let series = seriesData
        .map(serie => {
            return {
                "name": serie.name,
                "items": serie
                    .games
                    .map( (gameId) => games_dictionary[gameId])
                    .filter(game => game !== undefined)
            }
        })
        .filter(serie => serie.items.length > 1)
        .sort(sortByNameASC);

    return NextResponse.json(series, {
        headers: {
            "Cache-Control": "public, max-age=86400, must-revalidate"
        }
    });
}

function generateGamesResponse(gamesData : BasicGame[], integerDate : number) : EnhancedGame[]{

    return gamesData
        .filter(game => {

            // hide not yet public games on channel
            if (game?.availableAt !== undefined && game?.availableAt > integerDate) {
                return false;
            }

            // Either it is a valid game
            return true;
        })
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
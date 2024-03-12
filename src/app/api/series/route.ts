import { NextResponse } from "next/server";
import type { BasicGame, BasicPlaylist, BasicVideo, EnhancedGame, YTUrlType } from "@/redux/sharedDefintion";

export type serieType = {
    name: string,
    items: EnhancedGame[]
};

type rawEntry = {
    /* Name of the series */
    name: string;
    /* List of videoId or playlistId for this series */
    games: string[]
}
export type RawPayload = rawEntry[];

// Revalidate at most every day
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#revalidate
export const revalidate = 86400;

export async function GET() {

    // Fetch games data
    const gamesData = (await import("@/app/api/games/games.json")).default;
    const games = generateGamesResponse(gamesData as BasicGame[])

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

    return NextResponse.json(series);
}

function generateGamesResponse(gamesData : BasicGame[]) : EnhancedGame[]{

    // current date as integer (quicker comparaison)
    const currentDate = new Date();
    const integerDate = (currentDate.getFullYear() * 10000) + 
        ( (currentDate.getMonth() + 1) * 100 ) + 
        currentDate.getDate();

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
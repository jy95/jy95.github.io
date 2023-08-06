import { NextResponse } from "next/server";
import type { EnhancedGame } from "@/redux/sharedDefintion";
import type { ResponseBody as GamesResponseBody } from "@/app/api/games/route";

export type serieType = {
    name: string,
    items: EnhancedGame[]
};

export async function GET(_request: Request) {

    // Fetch all games
    const gamesUrl = "/api/games" + '?' + new URLSearchParams({
        limit: "-1"
    }).toString();

    const gamesPayload = await fetch(gamesUrl);
    const games = await gamesPayload.json() as GamesResponseBody;

    // Fetch series data
    const seriesData = (await import("./series.json")).default;

    // Convert array to { "id": Game }
    let games_dictionary = games
        .items
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
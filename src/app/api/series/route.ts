import { NextResponse } from "next/server";
import { generateResponse as generateGamesResponse } from "@/app/api/games/route";
import type { BasicGame, EnhancedGame } from "@/redux/sharedDefintion";

export type serieType = {
    name: string,
    items: EnhancedGame[]
};

export async function GET(_request: Request) {

    // Fetch games data
    const gamesData = (await import("@/app/api/games/games.json")).default;
    const games = generateGamesResponse({
        filters: {},
        sorters: [],
        page: 1,
        pageSize: -1,
        includePreviousPagesResult: true
    }, gamesData as BasicGame[])

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
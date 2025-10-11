import { NextResponse } from "next/server";
import { extractGameCardProps } from "@/redux/sharedDefintion";
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

    // Fetch series data
    const seriesData = (await import("./series.json")).default;

    const series : serieType[] = seriesData.map(serie => ({
        name: serie.name,
        items: fromRawGamesToCardGames(serie.items as RawGame[])
    }) )
    
    return NextResponse.json(series, {
        headers: {
            "Cache-Control": "public, max-age=86400, must-revalidate"
        }
    });
}

function fromRawGamesToCardGames(gamesData : RawGame[]) : CardGame[]{

    return gamesData
        .map(game => {

            // 🚀 Extracted Logic: Call the helper function to get the derived properties
            const { id, url, url_type } = extractGameCardProps(game);

            return {
                ...game,
                id,
                genres: [],
                imagePath: `/covers/${id}/cover.webp`,
                url,
                url_type
            }
        });
}
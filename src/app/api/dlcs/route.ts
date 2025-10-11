import { NextResponse } from "next/server";
import { extractGameCardProps } from "@/redux/sharedDefintion";
// Assuming BasicVideo is also imported or defined in sharedDefintion
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
    // Fetch dlcs data
    const dlcsData = (await import("./dlcs.json")).default;

    const dlcs : dlcType[] = dlcsData.map((dlc) => ({
        name: dlc.game_title,
        items: fromRawGamesToCardGames(dlc.dlcs as RawGame[])
    }) )
    
    return NextResponse.json(dlcs, {
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
                // Add the new properties required by CardGame
                id,
                // Required placeholders for CardGame interface
                genres: [], 
                platform: 0, 
                
                // Add properties from CardEntry interface
                imagePath: `/covers/${id}/cover.webp`,
                url,
                url_type,
            }
        });
}
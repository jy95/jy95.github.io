import { NextResponse } from "next/server";
// Assuming BasicVideo is also imported or defined in sharedDefintion
import type { BasicGame, BasicPlaylist, BasicVideo, CardGame, YTUrlType } from "@/redux/sharedDefintion";

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

interface GameProps {
    id: string;
    url: string;
    url_type: YTUrlType;
}


export async function GET() {
    // Fetch dlcs data
    const dlcsData = (await import("./dlcs.json")).default;

    const dlcs : dlcType[] = dlcsData.map((dlc) => ({
        name: dlc.game_title,
        items: fromRawGamesToCardGames(dlc.dlcs as rawGame[])
    }) )
    
    return NextResponse.json(dlcs, {
        headers: {
            "Cache-Control": "public, max-age=86400, must-revalidate"
        }
    });
}

// 🎯 User-Defined Type Guard
function isPlaylist(game: rawGame): game is Omit<BasicPlaylist, "genres" | "id"> {
    return 'playlistId' in game;
}

function extractGameCardProps(game: rawGame): GameProps {
    
    const isPlaylistType = isPlaylist(game);
    const url_type: YTUrlType = isPlaylistType ? "PLAYLIST" : "VIDEO";
    const id: string = isPlaylist(game) ? game.playlistId : (game as Omit<BasicVideo, "genres" | "id">).videoId;

    return {
        id,
        url: isPlaylistType ? `https://www.youtube.com/playlist?list=${id}` : `https://www.youtube.com/watch?v=${id}`,
        url_type
    }
}

function fromRawGamesToCardGames(gamesData : rawGame[]) : CardGame[]{

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
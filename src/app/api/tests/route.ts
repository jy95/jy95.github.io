import { NextResponse } from "next/server";
import type { 
    BasicGame, 
    CardGame,
    BasicPlaylist,
    BasicVideo,
    YTUrlType
} from "@/redux/sharedDefintion";

export type TestsResponse = {
    items: CardGame[],
    total_items: number
}

export async function GET(request: Request) {

    // Get query parameters
    const { searchParams } = new URL(request.url);

    // Fetch tests
    const gamesData = (await import("./tests.json")).default;

    // return subset
    const limit = searchParams.has("limit") ? parseInt(searchParams.get("limit")!) : -1;
    const offset = searchParams.has("offset") ? parseInt(searchParams.get("offset")!) : 0;
    const games = (limit === -1) ? gamesData : gamesData.slice(offset, limit);

    // Returns results
    return NextResponse.json({
        items: games.map(game => enhanceGameItem(game as BasicGame)),
        total_items: gamesData.length,
        limit: limit,
        offset: offset
    });
}

const SIZES = [
    // Mobile view (small) : 1 entry per row 
    "(max-width: 600px) 100vw",
    // Mobile view : 2 entry per row 
    "(max-width: 600px) 100vw",
    // (Default size) : 4 entries per row 
    "25vw"
]

// Return an enhanced payload for a single game
function enhanceGameItem(game: BasicGame): CardGame {

    const id = (game as BasicPlaylist).playlistId ?? (game as BasicVideo).videoId;
    const base_url = (
        ("playlistId" in game) 
            ? "https://www.youtube.com/playlist?list=" 
            :  "https://www.youtube.com/watch?v="
    ) + id ;

    return Object.assign({}, game, {
        id,
        imagePath: `/testscovers/${id}/${ game?.coverFile ?? "cover.webp" }`,
        sizes: (game?.hasResponsiveImages || true) 
            ? SIZES.join(", ") 
            : undefined,
        releaseDate: game.releaseDate
            .split("/")
            .reduce( (acc : number, curr : string, idx : number) => acc + (parseInt(curr) * Math.pow(100, idx)), 0),
        url: base_url,
        url_type: ("playlistId" in game) ? "PLAYLIST" : "VIDEO" as YTUrlType,
        durationAsInt: (game.duration)
            ? Number(game.duration.replaceAll(":", ""))
            : 0
    });
}
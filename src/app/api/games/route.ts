import { NextResponse } from "next/server";
import Fuse from 'fuse.js'

import type { 
    BasicGame, 
    CardGame, 
    BasicVideo, 
    BasicPlaylist, 
    YTUrlType,
    Platform,
    Genre
} from "@/redux/sharedDefintion";

// Extract criteria from request into something useful for me

const SIZES = [
    // Mobile view : 2 entries per row 
    "(max-width: 600px) 50vw",
    // Tablet view : 4 entries
    "(max-width: 1280px) 25vw",
    // Desktop view (Default size) : 8 entries per row 
    "12.50vw"
];

// Types
type gamesFilters = {
    platform?: Platform,
    title?: string,
    genres?: Genre[]
}

// Request parameters
type RequestParams = {
    // filter criteria
    filters: gamesFilters,
    // page size
    // If equal to -1, it means full result
    pageSize: number
    // requested page
    page: number
    // include previous page result ?
    includePreviousPagesResult: boolean
    // From which date produces the resultset ? 
    // Format : "YYYYMMDD" , example "20240520"
    dateAsInteger?: number
}

export type ResponseBody = {
    // the games we are looking for
    items: CardGame[],
    // Filter criteria used
    filters: gamesFilters,
    // Number of result matching criteria
    total_items: number,
    // Number of page available
    total_pages: number,
    // Page size used
    // If equal to -1, it means full result
    pageSize: number,
    // Current page
    page: number
}

type rawEntry = Omit<BasicGame, "id">;
export type RawPayload = rawEntry[];

export async function GET(request: Request) {

    // Get query parameters
    const { searchParams } = new URL(request.url);

    // Convert them into a utility object
    const params = extractParameters(searchParams);

    // Fetch original json
    const gamesData = (await import("./games.json")).default;

    // generate response
    const response = generateResponse(params, gamesData as RawPayload);

    return NextResponse.json(response, {
        headers: {
            "Cache-Control": "public, max-age=86400, must-revalidate"
        }
    });
}

// Function used by /games & /series endpoints as Next.js can't invoke /games inside /series
function generateResponse(params : RequestParams, gamesData: RawPayload): ResponseBody {

    // filter result according to criteria
    const filtered_games = gamesData
        .filter(game => {
            
            // hide not yet public games on channel
            if (game?.availableAt !== undefined && params.dateAsInteger !== undefined && game?.availableAt > params?.dateAsInteger) {
                return false;
            }

            // hide not matching platforms
            if (params.filters.platform !== undefined && game.platform !== params.filters.platform) {
                return false;
            }

            // hide not matching genres
            if (params.filters.genres !== undefined && !params.filters.genres.some(v => game.genres.includes(v)) ) {
                return false;
            }

            // Either it is a valid game
            return true;
        });

    const results = (params.filters.title === undefined) 
        ? filtered_games
        : new Fuse(filtered_games, {keys: ["title"]}).search(params.filters.title).map(s => s.item)
    
    return {
        items: sortedAndFilteredResultset(params, results),
        total_items: results.length,
        total_pages: Math.ceil(results.length / params.pageSize),
        page: params.page,
        pageSize: params.pageSize,
        filters: params.filters
    }
}

// Return subset and sorted resultset
function sortedAndFilteredResultset(params : RequestParams, games: RawPayload) : CardGame[] {

    // Bound for result
    const [startOffset, endOffset] = (params.includePreviousPagesResult) 
        ? [0, params.pageSize * params.page]
        : [ (params.pageSize - 1) * params.page, params.pageSize * params.page];

    // No sort criteria, return the filtered list only
    return ((params.pageSize === -1) ? games : games.slice(startOffset, endOffset)).map(enhanceGameItem);
}

// Convert input parameters to my structures
function extractParameters(params: URLSearchParams): RequestParams {
    
    // filters
    let filters : gamesFilters = {};

    // 1. platform
    if (params.has("selected_platform")) {
        filters["platform"] = params.get("selected_platform")! as any
    }

    // 2. title
    if (params.has("selected_title")) {
        filters["title"] = params.get("selected_title")!
    }

    // 3. genres
    if (params.has("selected_genres")) {
        filters["genres"] = params.getAll("selected_genres") as Genre[]
    }

    return {
        page: parseInt(params.get("page") || "1"),
        pageSize: parseInt(params.get("pageSize") || "16"),
        dateAsInteger: parseInt(params.get("dateAsInteger") || "0"),
        filters: filters,
        includePreviousPagesResult: (params.has("includePreviousPagesResult")) ? !!params.get("includePreviousPagesResult") : false
    }
}

// Return an enhanced payload for a single game
function enhanceGameItem(game: rawEntry): CardGame {

    const id = (game as BasicPlaylist).playlistId ?? (game as BasicVideo).videoId;
    const base_url = (
        ("playlistId" in game) 
            ? "https://www.youtube.com/playlist?list=" 
            :  "https://www.youtube.com/watch?v="
    ) + id ;

    return Object.assign({}, game, {
        id,
        imagePath: `/covers/${id}/${ game?.coverFile ?? "cover.webp" }`,
        sizes: SIZES.join(", "),
        url: base_url,
        url_type: ("playlistId" in game) ? "PLAYLIST" : "VIDEO" as YTUrlType
    });
}
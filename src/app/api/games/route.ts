import { NextResponse } from "next/server";
import Fuse from 'fuse.js'

import type { 
    BasicGame, 
    CardGame, 
    BasicVideo, 
    BasicPlaylist, 
    YTUrlType,
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
    platform?: number,
    title?: string,
    genres?: number[]
}

// Request parameters
type RequestParams = {
    // filter criteria
    filters?: gamesFilters,
    // page size
    pageSize?: number
    // requested page
    page: number
}

export type ResponseBody = {
    // the games we are looking for
    items: CardGame[],
    // Filter criteria used
    filters?: gamesFilters,
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
    const filters = params.filters;

    const filtered_games = 
        (filters === undefined) 
            ? gamesData 
            : gamesData.filter(game => {
            
                // hide not matching platforms
                if (filters.platform !== undefined && game.platform !== filters.platform) {
                    return false;
                }
    
                // hide not matching genres
                if (filters.genres !== undefined && !filters.genres.some(v => game.genres.includes(v)) ) {
                    return false;
                }
    
                // Either it is a valid game
                return true;
            });

    const results = (filters?.title === undefined) 
        ? filtered_games
        : new Fuse(filtered_games, {keys: ["title"]}).search(filters.title).map(s => s.item);

    // page info
    const total_pages = (params.pageSize) ? Math.ceil(results.length / params.pageSize) : 1;
    const pageSize = params.pageSize || -1;
    
    return {
        items: sortedAndFilteredResultset(params, results),
        total_items: results.length,
        total_pages: total_pages,
        page: params.page,
        pageSize: pageSize,
        filters: params.filters
    }
}

// Return subset and sorted resultset
function sortedAndFilteredResultset(params : RequestParams, games: RawPayload) : CardGame[] {

    // Calculate pagination offsets
    const pageSize = params.pageSize || games.length;
    const startOffset = (params.page - 1) * pageSize;
    const endOffset = startOffset + pageSize;

    // No sort criteria, return the filtered list only
    return games.slice(startOffset, endOffset).map(enhanceGameItem);
}

// Convert input parameters to my structures
function extractParameters(params: URLSearchParams): RequestParams {
    
    let result : RequestParams = {
        page: parseInt(params.get("page") || "1")
    };

    // Extract parameters
    const pageSize = params.get("pageSize");
    const selected_platform = params.get("selected_platform");
    const selected_title = params.get("selected_title");
    const selected_genres = params.getAll("selected_genres");

    if (pageSize !== null) {
        result.pageSize = parseInt(pageSize);
    }

    if (selected_platform !== null) {
        result.filters = {};
        result.filters.platform = parseInt(selected_platform);
    }

    if (selected_title !== null) {
        result.filters = result.filters || {};
        result.filters.title = selected_title;
    }

    if (selected_genres.length > 0) {
        result.filters = result.filters || {};
        result.filters.genres = selected_genres.map(parseInt);
    }

    return result;
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
import { NextResponse } from "next/server";
import Fuse from 'fuse.js';

import type { 
    BasicGame, 
    CardGame, 
    BasicVideo, 
    BasicPlaylist, 
    YTUrlType,
} from "@/redux/sharedDefintion";

// Types
type gamesFilters = {
    platform?: number,
    title?: string,
    genres?: number[]
};

// Request parameters
type RequestParams = {
    filters?: gamesFilters,
    pageSize?: number,
    page: number
};

export type ResponseBody = {
    items: CardGame[],
    filters?: gamesFilters,
    total_items: number,
    total_pages: number,
    pageSize: number,
    page: number
};

type rawEntry = Omit<BasicGame, "id">;
export type RawPayload = rawEntry[];

export async function GET(request: Request) {
    // Get query parameters
    const { searchParams } = new URL(request.url);

    // Convert them into a utility object
    const params = extractParameters(searchParams);

    // Fetch original JSON
    const gamesData = (await import("./games.json")).default;

    // Generate response
    const response = generateResponse(params, gamesData as RawPayload);

    return NextResponse.json(response, {
        headers: {
            "Cache-Control": "public, max-age=86400, must-revalidate"
        }
    });
}

function generateResponse(params: RequestParams, gamesData: RawPayload): ResponseBody {
    // Apply filters
    const filters = params.filters;
    const filtered_games = (filters === undefined) 
        ? gamesData 
        : gamesData.filter(game => {
            if (filters.platform !== undefined && game.platform !== filters.platform) {
                return false;
            }
            if (filters.genres !== undefined && !filters.genres.some(v => game.genres.includes(v))) {
                return false;
            }
            return true;
        });

    // Apply search if title is specified
    const results = (filters?.title === undefined) 
        ? filtered_games
        : new Fuse(filtered_games, { keys: ["title"] }).search(filters.title).map(s => s.item);

    // Calculate pagination details
    const pageSize = params.pageSize || results.length;  // Use results length as fallback
    const total_items = results.length;
    const total_pages = pageSize > 0 ? Math.ceil(total_items / pageSize) : 1;
    const startOffset = (params.page - 1) * pageSize;
    const endOffset = startOffset + pageSize;

    // Return the response
    return {
        items: sortedAndFilteredResultset(startOffset, endOffset, results),
        total_items,
        total_pages,
        pageSize,
        page: params.page,
        filters: params.filters
    };
}

// Return subset of result set based on pagination
function sortedAndFilteredResultset(startOffset: number, endOffset: number, games: RawPayload): CardGame[] {
    return games.slice(startOffset, endOffset).map(enhanceGameItem);
}

// Convert input parameters to my structures
function extractParameters(params: URLSearchParams): RequestParams {

    // Extract parameters
    const page = parseInt(params.get("page") || "1", 10);
    const pageSizeParam = params.get("pageSize");
    const pageSize = (pageSizeParam) ? parseInt(pageSizeParam, 10) : undefined;

    // Extract filters
    const selected_platform = params.get("selected_platform");
    const selected_genres = params.get("selected_genres");
    const title = params.get("selected_title") || undefined;
    const genres = selected_genres ? selected_genres.split(",").map(v => parseInt(v, 10)) : [];

    // Apply filters
    const filters: gamesFilters = {
        platform: selected_platform ? parseInt(selected_platform, 10) : undefined,
        genres: genres.length > 0 ? genres : undefined,
        title,
    };
    const hasDefinedValues = Object.values(filters).some(value => value !== undefined);

    // Return result
    return {
        page,
        pageSize,
        filters: hasDefinedValues ? filters : undefined
    }
}

// Return an enhanced payload for a single game
function enhanceGameItem(game: rawEntry): CardGame {
    const id = (game as BasicPlaylist).playlistId ?? (game as BasicVideo).videoId;
    const base_url = ("playlistId" in game)
        ? `https://www.youtube.com/playlist?list=${id}`
        : `https://www.youtube.com/watch?v=${id}`;

    return {
        ...game,
        id,
        imagePath: `/covers/${id}/${game.coverFile ?? "cover.webp"}`,
        url: base_url,
        url_type: ("playlistId" in game) ? "PLAYLIST" : "VIDEO" as YTUrlType
    };
}

import { NextResponse } from "next/server";
import Fuse from 'fuse.js';
import { buildCardEntry } from "@/redux/sharedDefintion";

import type { BasicGame, CardGame } from "@/redux/sharedDefintion";

// Types
type gamesFilters = {
    platform?: number,
    title?: string,
    genres?: number[]
};

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
    const { searchParams } = new URL(request.url);
    const params = extractParameters(searchParams);
    const gamesData = (await import("./games.json")).default;
    const response = generateResponse(params, gamesData as RawPayload);

    return NextResponse.json(response, {
        headers: {
            "Cache-Control": "public, max-age=86400, must-revalidate"
        }
    });
}

function generateResponse(params: RequestParams, gamesData: RawPayload): ResponseBody {
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

    const results = (filters?.title === undefined)
        ? filtered_games
        : new Fuse(filtered_games, { keys: ["title"] }).search(filters.title).map(s => s.item);

    const pageSize = params.pageSize || results.length;
    const total_items = results.length;
    const total_pages = pageSize > 0 ? Math.ceil(total_items / pageSize) : 1;
    const startOffset = (params.page - 1) * pageSize;
    const endOffset = startOffset + pageSize;

    return {
        items: sortedAndFilteredResultset(startOffset, endOffset, results),
        total_items,
        total_pages,
        pageSize,
        page: params.page,
        filters: params.filters
    };
}

function sortedAndFilteredResultset(startOffset: number, endOffset: number, games: RawPayload): CardGame[] {
    return games.slice(startOffset, endOffset).map(enhanceGameItem);
}

function extractParameters(params: URLSearchParams): RequestParams {
    const page = parseInt(params.get("page") || "1", 10);
    const pageSizeParam = params.get("pageSize");
    const pageSize = (pageSizeParam) ? parseInt(pageSizeParam, 10) : undefined;

    const selected_platform = params.get("selected_platform");
    const selected_genres = params.getAll("selected_genres");
    const title = params.get("selected_title") || undefined;
    const genres = selected_genres ? selected_genres.map(v => parseInt(v, 10)) : [];

    const filters: gamesFilters = {
        platform: selected_platform ? parseInt(selected_platform, 10) : undefined,
        genres: genres.length > 0 ? genres : undefined,
        title,
    };
    const hasDefinedValues = Object.values(filters).some(value => value !== undefined);

    return {
        page,
        pageSize,
        filters: hasDefinedValues ? filters : undefined
    }
}

// Return an enhanced payload for a single game
function enhanceGameItem(game: rawEntry): CardGame {
    return {
        ...game,
        ...buildCardEntry(game, "/covers")
    };
}
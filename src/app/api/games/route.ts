import { NextResponse } from "next/server";
import Fuse from 'fuse.js';
import { buildCardGame } from "@/domain/games";
import { COVER_PATHS } from "@/domain/games/coverPaths";
import { searchParamsToFilters } from "@/lib/gamesFilterUtils";
import { sortGames } from "@/lib/gamesSort";

import type { RawGame, CardGame } from "@/domain/games";
import type { GameFilters } from "@/types/gamesFilters";

// Types
type RequestParams = {
    filters?: GameFilters,
    pageSize?: number,
    page: number
};

export type ResponseBody = {
    items: CardGame[],
    filters?: GameFilters,
    total_items: number,
    total_pages: number,
    pageSize: number,
    page: number
};

type rawEntry = RawGame & { genres: number[] };
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

    const sortedResults = sortGames(results, filters?.sort);

    const pageSize = params.pageSize || results.length;
    const total_items = results.length;
    const total_pages = pageSize > 0 ? Math.ceil(total_items / pageSize) : 1;
    const startOffset = (params.page - 1) * pageSize;
    const endOffset = startOffset + pageSize;

    return {
        items: sortedAndFilteredResultset(startOffset, endOffset, sortedResults),
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

    const filters = searchParamsToFilters(params);

    return {
        page,
        pageSize,
        filters: Object.keys(filters).length > 0 ? filters : undefined
    }
}

// Return an enhanced payload for a single game
function enhanceGameItem(game: rawEntry): CardGame {
    return buildCardGame(game, COVER_PATHS.games);
}

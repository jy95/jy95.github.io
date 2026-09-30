import { cachedJson } from "@/lib/http/cachedJson";
import Fuse from 'fuse.js';
import { loadPublishedGames, toPublishedGame } from "@/lib/gamesData";
import type { RawPublishedGame } from "@/lib/gamesData";
import { getReleaseYearRange, releaseYear, searchParamsToFilters } from "@/lib/gamesFilterUtils";
import { sortGames } from "@/lib/gamesSort";

import type { CardGame } from "@/domain/games";
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

export type RawPayload = RawPublishedGame[];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const params = extractParameters(searchParams);
    const gamesData = await loadPublishedGames();
    const response = generateResponse(params, gamesData);

    return cachedJson(response);
}

function generateResponse(params: RequestParams, gamesData: RawPayload): ResponseBody {
    const filters = params.filters;
    const releaseRange = filters && (filters.releaseDateFrom !== undefined || filters.releaseDateTo !== undefined)
        ? getReleaseYearRange(filters)
        : undefined;
    const filteredGames = (filters === undefined)
        ? gamesData
        : gamesData.filter(game => {
            if (filters.platform !== undefined && game.platform !== filters.platform) {
                return false;
            }
            if (filters.genres !== undefined && !filters.genres.some(v => game.genres.includes(v))) {
                return false;
            }
            if (releaseRange) {
                const year = releaseYear(game.releaseDate);
                const [from, to] = releaseRange;
                if (year === undefined || year < from || year > to) return false;
            }
            return true;
        });

    const results = (filters?.title === undefined)
        ? filteredGames
        : new Fuse(filteredGames, { keys: ["title"] }).search(filters.title).map(s => s.item);

    const sortedResults = sortGames(results, filters?.sort);

    const pageSize = params.pageSize || results.length;
    const total_items = results.length;
    const total_pages = pageSize > 0 ? Math.ceil(total_items / pageSize) : 1;
    const startOffset = (params.page - 1) * pageSize;
    const endOffset = startOffset + pageSize;

    return {
        items: sortedResults.slice(startOffset, endOffset).map(toPublishedGame),
        total_items,
        total_pages,
        pageSize,
        page: params.page,
        filters: params.filters
    };
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

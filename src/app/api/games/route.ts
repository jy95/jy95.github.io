import { NextResponse } from "next/server";

import type { 
    BasicGame, 
    EnhancedGame, 
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

const sortCriterias = ["name", "releaseDate", "duration"] as const;
type sortCriteria = typeof sortCriterias[number];
type gamesSorters = [
    sortCriteria,
    "ASC" | "DESC"
][];

// Request parameters
type RequestParams = {
    // filter criteria
    filters: gamesFilters,
    // sort results
    sorters: gamesSorters,
    // page size
    // If equal to -1, it means full result
    pageSize: number
    // requested page
    page: number
    // include previous page result ?
    includePreviousPagesResult: boolean
}

export type ResponseBody = {
    // the games we are looking for
    items: EnhancedGame[],
    // Filter criteria used
    filters: gamesFilters,
    // sort results used
    sorters: gamesSorters,
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

export async function GET(request: Request) {

    // Get query parameters
    const { searchParams } = new URL(request.url);

    // Convert them into a utility object
    const params = extractParameters(searchParams);

    // Fetch original json
    const gamesData = (await import("./games.json")).default;

    // generate response
    const response = generateResponse(params, gamesData as BasicGame[]);

    return NextResponse.json(response);
}

// Function used by /games & /series endpoints as Next.js can't invoke /games inside /series
export function generateResponse(params : RequestParams, gamesData: BasicGame[]): ResponseBody {

    // current date as integer (quicker comparaison)
    const currentDate = new Date();
    const integerDate = (currentDate.getFullYear() * 10000) + 
        ( (currentDate.getMonth() + 1) * 100 ) + 
        currentDate.getDate();

    // filter result according to criteria
    const filtered_games = gamesData
        .filter(game => {
            
            // hide not yet public games on channel
            if (game?.availableAt !== undefined && game?.availableAt > integerDate) {
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

            // hide not matching title
            if (params.filters.title !== undefined && game.title.search(new RegExp(params.filters.title, "i")) === -1) {
                return false;
            }

            // Either it is a valid game
            return true;
        });
    
    return {
        items: sortedAndFilteredResultset(params, filtered_games).map(enhanceGameItem),
        total_items: filtered_games.length,
        total_pages: Math.ceil(filtered_games.length / params.pageSize),
        page: params.page,
        pageSize: params.pageSize,
        filters: params.filters,
        sorters: params.sorters
    }
}

// Return subset and sorted resultset
function sortedAndFilteredResultset(params : RequestParams, games: BasicGame[]) : BasicGame[] {

    // Bound for result
    const [startOffset, endOffset] = (params.includePreviousPagesResult) 
        ? [0, params.pageSize * params.page]
        : [ (params.pageSize - 1) * params.page, params.pageSize * params.page];

    // No sort criteria, return the filtered list only
    if (params.sorters.length === 0) {
        return (params.pageSize === -1) ? games : games.slice(startOffset, endOffset);
    }

    // At least one criteria for sort
    const gamesData = games
        .map(game => {
            return {
                ...game,
                durationAsInt: (game.duration) ? Number(game.duration.replaceAll(":", "")) : 0,
                releaseDateAsInt: game.releaseDate
                    .split("/")
                    .reduce( (acc : number, curr : string, idx : number) => acc + (parseInt(curr) * Math.pow(100, idx)), 0),
            }
        })
        .sort( (a, b) => {
            for(let [field, order] of params.sorters) {
                
                let comparatorResult = 0;
                
                switch(field) {
                    case "releaseDate":
                        comparatorResult = (order === "ASC")
                            ? sortByReleaseDateASC(a.releaseDateAsInt, b.releaseDateAsInt)
                            : -sortByReleaseDateASC(a.releaseDateAsInt, b.releaseDateAsInt)
                        break;
                    case "duration":
                        comparatorResult = (order === "ASC")
                            ? sortByDurationASC(a.durationAsInt, b.durationAsInt)
                            : -sortByDurationASC(a.durationAsInt, b.durationAsInt)
                        break;
                    default:
                        comparatorResult = (order === "ASC") 
                            ? sortByNameASC(a.title, b.title)
                            : -sortByNameASC(a.title, b.title)
                }

                if (comparatorResult !== 0) {
                    return comparatorResult;
                }
            }
            return 0;
        })
    
    // filtered resultset ?
    return (params.pageSize === -1) ? gamesData : gamesData.slice(startOffset, endOffset);
}

// Sort function
const sortByNameASC = (a : string, b : string) => new Intl.Collator().compare(a, b);
const sortByDurationASC = (a : number, b : number) => (a < b) ? -1 : (a > b ? 1 : 0);
const sortByReleaseDateASC = (a : number, b : number) =>  (a < b) ? -1 : (a > b ? 1 : 0);

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

    // sorters
    let sortCriteria = params.getAll("sortCriteria");
    let sortOrders = params.getAll("sortOrder");

    let sorters : gamesSorters = sortCriteria
        .filter(criteria => sortCriterias.includes(criteria as any))
        .map( (criteria, index) => {

            let order = (index < sortOrders.length) ? sortOrders[index] : undefined;

            return [
                criteria as sortCriteria,
                (order === "ASC" || order === "DESC") ? order : "ASC"
            ]
        });

    return {
        page: parseInt(params.get("page") || "1"),
        pageSize: parseInt(params.get("pageSize") || "16"),
        filters: filters,
        sorters: sorters,
        includePreviousPagesResult: (params.has("includePreviousPagesResult")) ? !!params.get("includePreviousPagesResult") : false
    }
}

// Return an enhanced payload for a single game
function enhanceGameItem(game: BasicGame): EnhancedGame {

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
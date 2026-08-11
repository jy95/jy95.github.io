// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Types
import type { ResponseBody as GamesResponse } from "@/app/api/games/route";
import type { gamesFilters } from "@/redux/features/gamesSlice"

// parameters for method
type Parameters = {
    filters: gamesFilters,
    page: number,
    pageSize: number,
}

type FrontendParams = Omit<Parameters, "page">;

type GamesFilter = gamesFilters[number];

/**
 * One serializer per filter `key`, keyed so TypeScript enforces a case for
 * every member of the `gamesFilters` discriminated union (see
 * `gamesSlice.tsx`). This used to be a runtime `switch` with a generic
 * `default` branch that called `.toString()` on whatever value showed up —
 * adding a new filter kind to the slice without updating this file would
 * silently mis-serialize it instead of failing to compile.
 */
const FILTER_SERIALIZERS: {
    [K in GamesFilter["key"]]: (
        params: URLSearchParams,
        value: Extract<GamesFilter, { key: K }>["value"]
    ) => void
} = {
    selected_title: (params, value) => {
        params.append("selected_title", value);
    },
    selected_platform: (params, value) => {
        params.append("selected_platform", value.toString());
    },
    selected_genres: (params, value) => {
        for (const genre of value) {
            params.append("selected_genres", genre.toString());
        }
    },
};

function appendFilter(params: URLSearchParams, filter: GamesFilter) {
    // The dispatch table above is exhaustively typed over `GamesFilter["key"]`;
    // this cast is only needed because TS can't narrow a mapped-type lookup
    // by a value it hasn't seen yet inside a loop. The exhaustiveness
    // guarantee lives in `FILTER_SERIALIZERS`'s declared type above, not here.
    const serialize = FILTER_SERIALIZERS[filter.key] as (
        params: URLSearchParams,
        value: GamesFilter["value"]
    ) => void;
    serialize(params, filter.value);
}

// Define a service using a base URL and expected endpoints
export const gamesAPI = createApi({
    reducerPath: 'gamesApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    endpoints: (builder) => ({
        getGames: builder.infiniteQuery<GamesResponse, FrontendParams, number>({
            infiniteQueryOptions: {
                // Must provide a default initial page param value
                initialPageParam: 1,
                // Must provide a `getNextPageParam` function
                getNextPageParam: (lastPage, _, lastPageParam) =>  lastPageParam <lastPage.total_pages 
                    ? lastPageParam + 1 
                    : undefined,
            },
            // The `query` function receives `{queryArg, pageParam}` as its argument
            query({ queryArg, pageParam }) {

                const searchParams = new URLSearchParams();
                searchParams.append("page", pageParam.toString());
                searchParams.append("pageSize", queryArg.pageSize.toString());

                // filters parameter
                for (const filter of queryArg.filters) {
                    appendFilter(searchParams, filter);
                }

                const query = searchParams.toString();
                return `/games?${query}`;
            }
        })
    })
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetGamesInfiniteQuery } = gamesAPI;
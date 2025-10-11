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

// Parameters for API
type RequestParams = {
    selected_platform?: string,
    selected_title?: string,
    selected_genres?: string[],
    page: number,
    pageSize: number,
}

type FrontendParams = Omit<Parameters, "page">;

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
                const parameters : RequestParams = {
                    // page size
                    pageSize: queryArg.pageSize,
                    // asked page
                    page: pageParam,
                };
                // filters parameter
                const filters = queryArg.filters;

                // filters parameter
                if (filters.length > 0) {
                    for(const filter of filters) {
                        parameters[filter.key] = filter.value as any;
                    }
                }

                const query = new URLSearchParams(parameters as any);
                return `/games?${query.toString()}`;
            }
        })
    })
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetGamesInfiniteQuery } = gamesAPI;
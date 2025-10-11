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
                const filters = queryArg.filters;

                // filters parameter
                if (filters.length > 0) {
                    for(const filter of filters) {
                        switch(filter.key) {
                            case "selected_genres":
                                for(const genre of filter.value) {
                                    searchParams.append(filter.key, genre.toString());
                                }
                                break;
                            default:
                                // Append other filters directly
                                searchParams.append(filter.key, filter.value.toString());
                        }
                    }
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
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

const stringifyObject = (object: any) => {
    const queryStr = Object.keys(object)
      .map((key) => {
        const values = object[key];
        if (Array.isArray(values)) {
          return values.map((value) => `${key}=${value}`).join("&");
        } else {
          return `${key}=${object[key]}`;
        }
      })
      .join("&");
  
    return queryStr;
};

// Define a service using a base URL and expected endpoints
export const gamesAPI = createApi({
    reducerPath: 'gamesApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    endpoints: (builder) => ({
        getGames: builder.query<GamesResponse, Parameters>({
            query: ({ pageSize, page, filters }) => {


                let parameters : RequestParams = {
                    // page size
                    pageSize: pageSize,
                    // asked page
                    page: page,
                };

                // filters parameter
                if (filters.length > 0) {
                    for(let filter of filters) {
                        parameters[filter.key] = filter.value as any;
                    }
                }

                return `/games?${stringifyObject(parameters)}`;
            },
            // Force refresh when offset change
            forceRefetch: ({ currentArg, previousArg }) => {
                return currentArg !== previousArg;
            },
            // Custom key for cache
            serializeQueryArgs: ({ endpointName }) => endpointName,
            // merge incoming data to the cache entry when possible
            merge: (_currentCache, newItems) => {
                // API is returning all the results, so need to put advanced strategy here
                // Maybe one day fix that behavior
                return newItems;
            }
        })
    })
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useLazyGetGamesQuery } = gamesAPI;
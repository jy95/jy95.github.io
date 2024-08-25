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
            forceRefetch: ({ currentArg, previousArg }) => {
                return JSON.stringify(currentArg) !== JSON.stringify(previousArg);
            },
            // Custom key for cache
            serializeQueryArgs: ({ endpointName }) => endpointName,
            // merge incoming data to the cache entry when possible
            merge: (currentCache, newItems) => {
                
                let currentParams = { filters: currentCache.filters, pageSize: currentCache.pageSize };
                let newParams = { filters: newItems.filters, pageSize: newItems.pageSize };
                let notSameParams = JSON.stringify(currentParams) !== JSON.stringify(newParams);

                // If not same parameters, it means we have to replace by newest answer
                if (notSameParams) {
                    return newItems;
                }

                // If same parameters, it means we have to merge them
                return {
                    ...currentCache,
                    items: [...currentCache.items, ...newItems.items],
                    page: newItems.page
                };
            },
        })
    })
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetGamesQuery } = gamesAPI;
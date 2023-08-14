// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { ResponseBody as GamesResponse } from "@/app/api/games/route";

type gamesSorters = [
    "name" | "releaseDate" | "duration",
    "ASC" | "DESC"
][];

// To compute new filtering function
//type gamesFilterKeys = "selected_platform" | "selected_title" | "selected_genres";
type gamesFilters = ({
    value: string,
    key: "selected_platform" | "selected_title"
} | {
    value: string[],
    key: "selected_genres"
})[];

// parameters for method
type Parameters = {
    filters: gamesFilters,
    sorters: gamesSorters,
    page: number,
    pageSize: number,
}

// Parameters for API
type RequestParams = {
    selected_platform?: string,
    selected_title?: string,
    selected_genres?: string[],
    sortCriteria?: string[],
    sortOrder?: string[],
    limit?: string,
    offset?: string
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
            query: ({ pageSize, page, filters, sorters }) => {
                let parameters : RequestParams = {};

                // limit parameter
                parameters["limit"] = `${pageSize}`;

                // page parameter
                parameters["offset"] = `${ (page -1) * pageSize}`

                // filters parameter
                if (filters.length > 0) {
                    for(let filter of filters) {
                        parameters[filter.key] = filter.value as any;
                    }
                }

                // sorters parameter
                if (sorters.length > 0) {
                    parameters["sortCriteria"] = sorters.map(s => s[0]);
                    parameters["sortOrder"] = sorters.map(s => s[1]);
                }

                if (Object.keys(parameters).length > 0) {
                    return `/games?${stringifyObject(parameters)}`;
                } else {
                    return `/games`
                }
            },
            // Force refresh when offset change
            forceRefetch: ({ currentArg, previousArg }) => {
                return currentArg !== previousArg;
            },
            // Custom key for cache
            serializeQueryArgs: ({ endpointName }) => endpointName,
            // merge incoming data to the cache entry when possible
            merge: (currentCache, newItems) => {
                // When applying new filters for example
                if (newItems.offset === 0) {
                    return newItems;
                } else {
                    currentCache.items.push(...newItems.items);
                    currentCache.limit = newItems.limit;
                    currentCache.offset = newItems.offset;
                    currentCache.total_items = newItems.total_items;
                    currentCache.total_pages = newItems.total_pages;
                    return currentCache;
                }
            }
        })
    })
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetGamesQuery } = gamesAPI;
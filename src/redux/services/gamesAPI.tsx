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
    limit?: number,
    offset?: number
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
            query: ({ limit, offset, filters, sorters }) => {
                let parameters : RequestParams = {};

                // limit parameter
                if (limit) {
                    parameters["limit"] = `${limit}`;
                }

                // offset parameter
                if (offset) {
                    parameters["offset"] = `${offset}`
                }

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
            serializeQueryArgs: ({ endpointName, queryArgs }) => {
                return `${endpointName}-${stringifyObject(queryArgs)}`
            },
            // Always merge incoming data to the cache entry
            merge: (currentCache, newItems) => {
                currentCache.items.push(...newItems.items);
                currentCache.limit = currentCache.offset + newItems.items.length;
                currentCache.offset = currentCache.offset;
            }
        })
    })
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetGamesQuery } = gamesAPI;
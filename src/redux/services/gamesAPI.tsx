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
            query: (params) => {
                let parameters : RequestParams = {};

                // limit parameter
                if (params.limit) {
                    parameters["limit"] = `${params.limit}`;
                }

                // offset parameter
                if (params.offset) {
                    parameters["offset"] = `${params.offset}`
                }

                // filters parameter
                if (params.filters.length > 0) {
                    for(let filters of params.filters) {
                        parameters[filters.key] = filters.value as any;
                    }
                }

                if (params.sorters.length > 0) {
                    parameters["sortCriteria"] = params.sorters.map(s => s[0]);
                    parameters["sortOrder"] = params.sorters.map(s => s[1]);
                }

                if (Object.keys(parameters).length > 0) {
                    return `/games?${stringifyObject(parameters)}`;
                } else {
                    return `/games`
                }
            }
        })
    })
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetGamesQuery } = gamesAPI;
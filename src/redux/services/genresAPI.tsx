// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { GenreResponse } from "@/app/api/genres/route";

// Define a service using a base URL and expected endpoints
export const genresAPI = createApi({
    reducerPath: 'genresApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    endpoints: (builder) => ({
        getGenres: builder.query<GenreResponse, void>({
            query: () => "/genres"
        })
    })
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetGenresQuery } = genresAPI
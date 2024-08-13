// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { serieType } from "@/app/api/series/route";

// Define a service using a base URL and expected endpoints
export const seriesAPI = createApi({
    reducerPath: 'seriesApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    endpoints: (builder) => ({
        getSeries: builder.query<serieType[], void>({
            query: () => "/series"
        })
    })
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetSeriesQuery } = seriesAPI
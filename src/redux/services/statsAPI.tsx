// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { statsProperty } from "@/app/api/stats/route";

// Define a service using a base URL and expected endpoints
export const statsAPI = createApi({
    reducerPath: 'statsAPI',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    endpoints: (builder) => ({
        getStats: builder.query<statsProperty, void>({
            query: () => "/stats"
        })
    })
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetStatsQuery } = statsAPI
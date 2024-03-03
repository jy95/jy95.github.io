// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BacklogEntry } from "@/app/api/backlog/route";

// Define a service using a base URL and expected endpoints
export const backlogAPI = createApi({
    reducerPath: 'backlogApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    endpoints: (builder) => ({
        getBacklog: builder.query<BacklogEntry[], void>({
            query: () => "/backlog"
        })
    })
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetBacklogQuery } = backlogAPI
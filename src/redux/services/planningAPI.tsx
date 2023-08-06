// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { planningEntry } from "@/app/api/planning/route";

// Define a service using a base URL and expected endpoints
export const planningAPI = createApi({
    reducerPath: 'planningApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    endpoints: (builder) => ({
        getPlanning: builder.query<planningEntry, undefined>({
            query: () => "/planning"
        })
    })
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetPlanningQuery } = planningAPI
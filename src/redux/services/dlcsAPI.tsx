// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { dlcType } from "@/app/api/dlcs/route";

// Define a service using a base URL and expected endpoints
export const dlcsAPI = createApi({
    reducerPath: 'dlcsApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    endpoints: (builder) => ({
        getDLCs: builder.query<dlcType[], void>({
            query: () => "/dlcs"
        })
    })
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetDLCsQuery } = dlcsAPI
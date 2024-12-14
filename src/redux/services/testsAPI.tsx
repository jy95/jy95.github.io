// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { TestsResponse } from "@/app/api/tests/route";

// parameters for method
type Parameters = {
    limit?: number,
    offset?: number
}

// Define a service using a base URL and expected endpoints
export const testsAPI = createApi({
    reducerPath: 'testApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    endpoints: (builder) => ({
        getTests: builder.query<TestsResponse, Parameters>({
            query: (params) => {
                let query = new URLSearchParams(params as any);
                return `/tests?${query.toString()}`;
            }
        })
    })
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetTestsQuery } = testsAPI;
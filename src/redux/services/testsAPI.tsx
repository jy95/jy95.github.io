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
                const stringParams: Record<string, string> = {};
                if (params.limit !== undefined) stringParams.limit = params.limit.toString();
                if (params.offset !== undefined) stringParams.offset = params.offset.toString();
                const query = new URLSearchParams(stringParams);
                return `/tests?${query.toString()}`;
            }
        })
    })
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetTestsQuery } = testsAPI;
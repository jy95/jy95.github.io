// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { TestsResponse } from "@/app/api/tests/route";

// parameters for method
type Parameters = {
    limit?: number,
    offset?: number
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
export const testsAPI = createApi({
    reducerPath: 'testApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    endpoints: (builder) => ({
        getTests: builder.query<TestsResponse, Parameters>({
            query: (params) => {
                if (Object.keys(params).length > 0) {
                    return `/tests?${stringifyObject(params)}`;
                } else {
                    return `/tests`;
                }
            }
        })
    })
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetTestsQuery } = testsAPI;
// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { PlatformsResponse } from "@/app/api/platforms/route";

// Define a service using a base URL and expected endpoints
export const platformsAPI = createApi({
    reducerPath: 'platformsApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    endpoints: (builder) => ({
        getPlatforms: builder.query<PlatformsResponse, void>({
            query: () => "/platforms"
        })
    })
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetPlatformsQuery } = platformsAPI
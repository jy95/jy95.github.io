// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { planningEntry } from "@/app/api/planning/route";

// Define a service using a base URL and expected endpoints
export const planningAPI = createApi({
    reducerPath: 'planningApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    endpoints: (builder) => ({
        getPlanning: builder.query<planningEntry[], void>({
            query: () => {

                const currentDate = new Date();
                const integerDate = (currentDate.getFullYear() * 10000) + 
                    ( (currentDate.getMonth() + 1) * 100 ) + 
                    currentDate.getDate();

                return `/planning?dateAsInteger=${integerDate}`
            }
        })
    })
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetPlanningQuery } = planningAPI
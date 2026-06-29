// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Types
import type { CardGame } from "@/redux/sharedDefintion";
import type { BacklogEntry } from "@/app/api/backlog/route";
import type { AppConfig } from 'next-intl';

type Ranking = keyof AppConfig["Messages"]["TierList"]["categories"]

type GamesTierList = Record<string, CardGame[]>;
type BacklogTierList = Record<string, BacklogEntry[]>;

type sortOption = "asc" | "desc";

// Define a service using a base URL and expected endpoints
export const tierListAPI = createApi({
    reducerPath: 'tierListAPI',
    baseQuery: fetchBaseQuery({ baseUrl: '/api/tier-lists' }),
    endpoints: (builder) => ({
        getGamesTierList: builder.query<GamesTierList, void>({
            query: () => "/games"
        }),
        getBacklogTierList: builder.query<BacklogTierList, void>({
            query: () => "/backlog"
        }),
        getSortedCategories: builder.query<Ranking[], sortOption>({
            query: (sortOrder) => `/categories?sort=${sortOrder}`
        })
    })
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetGamesTierListQuery, useGetBacklogTierListQuery, useGetSortedCategoriesQuery } = tierListAPI
import type { CardGame } from "@/redux/sharedDefintion";
import type { BacklogEntry } from "@/app/api/backlog/route";
import type { TierCategoryKey } from "@/types/tierList";
import { api } from "./api"

type GamesTierList = Record<string, CardGame[]>;
type BacklogTierList = Record<string, BacklogEntry[]>;
type TestsTierList = Record<string, CardGame[]>;
type sortOption = "asc" | "desc";

export const tierListAPI = api.injectEndpoints({
    endpoints: (builder) => ({
        getGamesTierList: builder.query<GamesTierList, void>({
            query: () => "/tier-lists/games"
        }),
        getBacklogTierList: builder.query<BacklogTierList, void>({
            query: () => "/tier-lists/backlog"
        }),
        getSortedCategories: builder.query<TierCategoryKey[], sortOption>({
            query: (sortOrder) => `/tier-lists/categories?sort=${sortOrder}`
        }),
        getTestsTierList: builder.query<TestsTierList, void>({
            query: () => "/tier-lists/tests"
        })
    })
});

export const {
    useGetGamesTierListQuery,
    useGetBacklogTierListQuery,
    useGetSortedCategoriesQuery,
    useGetTestsTierListQuery
} = tierListAPI

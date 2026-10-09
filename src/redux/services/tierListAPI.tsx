import type { CardGame } from "@/domain/games";
import type { BacklogEntry } from "@/app/api/backlog/route";
import type { TierCategoryKey } from "@/types/tierList";
import { api } from "./api"

type TierList<T> = Record<string, T[]>;
type SortOption = "asc" | "desc";

export const tierListAPI = api.injectEndpoints({
    endpoints: (builder) => ({
        getGamesTierList: builder.query<TierList<CardGame>, void>({
            query: () => "/tier-lists/games"
        }),
        getBacklogTierList: builder.query<TierList<BacklogEntry>, void>({
            query: () => "/tier-lists/backlog"
        }),
        getSortedCategories: builder.query<TierCategoryKey[], SortOption>({
            query: (sortOrder) => `/tier-lists/categories?sort=${sortOrder}`
        }),
        getTestsTierList: builder.query<TierList<CardGame>, void>({
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

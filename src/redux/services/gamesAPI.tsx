import { normalizeGameFilters, filtersToSearchParams } from '@/lib/gamesFilterUtils';
import type { ResponseBody as GamesResponse } from "@/app/api/games/route";
import type { GameFilters } from "@/types/gamesFilters"
import { api } from "./api"

type Parameters = {
    filters: GameFilters,
    page: number,
    pageSize: number,
}

type FrontendParams = Omit<Parameters, "page">;

export const gamesAPI = api.injectEndpoints({
    endpoints: (builder) => ({
        getGames: builder.infiniteQuery<GamesResponse, FrontendParams, number>({
            serializeQueryArgs: ({ queryArgs }) => ({
                pageSize: queryArgs.pageSize,
                filters: normalizeGameFilters(queryArgs.filters),
            }),
            infiniteQueryOptions: {
                initialPageParam: 1,
                getNextPageParam: (lastPage, _, lastPageParam) => lastPageParam < lastPage.total_pages
                    ? lastPageParam + 1
                    : undefined,
            },
            query({ queryArg, pageParam }) {
                const searchParams = filtersToSearchParams(queryArg.filters);
                searchParams.append("page", pageParam.toString());
                searchParams.append("pageSize", queryArg.pageSize.toString());

                return `/games?${searchParams.toString()}`;
            }
        })
    })
});

export const { useGetGamesInfiniteQuery } = gamesAPI;

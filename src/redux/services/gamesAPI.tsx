import { normalizeGameFilters, filtersToSearchParams } from '@/lib/gamesFilterUtils';
import type { ResponseBody as GamesResponse } from "@/app/api/games/route";
import type { GameFilters } from "@/types/gamesFilters"
import type { GameDetailsResponse } from "@/domain/games/details";
import { api } from "./api"

type GamesQueryArgs = {
    filters: GameFilters,
    pageSize: number,
}

export const gamesAPI = api.injectEndpoints({
    endpoints: (builder) => ({
        getGameDetails: builder.query<GameDetailsResponse, string>({
            query: (id) => `/games/${encodeURIComponent(id)}`,
        }),
        getGames: builder.infiniteQuery<GamesResponse, GamesQueryArgs, number>({
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

export const { useGetGamesInfiniteQuery, useGetGameDetailsQuery } = gamesAPI;

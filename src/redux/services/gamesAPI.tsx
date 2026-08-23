import type { ResponseBody as GamesResponse } from "@/app/api/games/route";
import type { gamesFilters } from "@/redux/features/gamesSlice"
import { api } from "./api"

type Parameters = {
    filters: gamesFilters,
    page: number,
    pageSize: number,
}

type FrontendParams = Omit<Parameters, "page">;

type GamesFilter = gamesFilters[number];
const FILTER_SERIALIZERS: {
    [K in GamesFilter["key"]]: (
        params: URLSearchParams,
        value: Extract<GamesFilter, { key: K }>["value"]
    ) => void
} = {
    selected_title: (params, value) => {
        params.append("selected_title", value);
    },
    selected_platform: (params, value) => {
        params.append("selected_platform", value.toString());
    },
    selected_genres: (params, value) => {
        for (const genre of value) {
            params.append("selected_genres", genre.toString());
        }
    },
};

function appendFilter(params: URLSearchParams, filter: GamesFilter) {
    const serialize = FILTER_SERIALIZERS[filter.key] as (
        params: URLSearchParams,
        value: GamesFilter["value"]
    ) => void;
    serialize(params, filter.value);
}

export const gamesAPI = api.injectEndpoints({
    endpoints: (builder) => ({
        getGames: builder.infiniteQuery<GamesResponse, FrontendParams, number>({
            infiniteQueryOptions: {
                initialPageParam: 1,
                getNextPageParam: (lastPage, _, lastPageParam) => lastPageParam < lastPage.total_pages
                    ? lastPageParam + 1
                    : undefined,
            },
            query({ queryArg, pageParam }) {
                const searchParams = new URLSearchParams();
                searchParams.append("page", pageParam.toString());
                searchParams.append("pageSize", queryArg.pageSize.toString());

                for (const filter of queryArg.filters) {
                    appendFilter(searchParams, filter);
                }

                return `/games?${searchParams.toString()}`;
            }
        })
    })
});

export const { useGetGamesInfiniteQuery } = gamesAPI;

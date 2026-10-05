import type { SeriesDetail, SeriesListArgs, SeriesListResponse } from "@/domain/series/types";
import { api } from "./api";

export const seriesAPI = api.injectEndpoints({
    endpoints: builder => ({
        getSeries: builder.infiniteQuery<SeriesListResponse, SeriesListArgs, number>({
            infiniteQueryOptions: {
                initialPageParam: 1,
                getNextPageParam: (lastPage, _, lastPageParam) => lastPageParam < lastPage.total_pages ? lastPageParam + 1 : undefined,
            },
            query: ({ queryArg, pageParam }) => `/series?${new URLSearchParams({ filter: queryArg.filter, sort: queryArg.sort, pageSize: String(queryArg.pageSize), page: String(pageParam) })}`,
        }),
        getSeriesById: builder.query<SeriesDetail, string>({ query: id => `/series/${encodeURIComponent(id)}` }),
    }),
});

export const { useGetSeriesInfiniteQuery } = seriesAPI;
export const useGetSeriesQuery = seriesAPI.useGetSeriesByIdQuery;

export const resetPages = (args: SeriesListArgs) => seriesAPI.util.updateQueryData("getSeries", args, cached => {
    cached.pages.splice(1);
    cached.pageParams.splice(1);
});

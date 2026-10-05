import type { SeriesDetail, SeriesListArgs, SeriesListResponse } from "@/domain/series/types";
import { api } from "./api";
import { buildQueryUrl, infinitePaginationOptions } from "./pagination";

export const seriesAPI = api.injectEndpoints({
    endpoints: builder => ({
        getSeries: builder.infiniteQuery<SeriesListResponse, SeriesListArgs, number>({
            infiniteQueryOptions: infinitePaginationOptions<SeriesListResponse>(),
            query: ({ queryArg, pageParam }) => buildQueryUrl("/series", {
                filter: queryArg.filter, sort: queryArg.sort, pageSize: queryArg.pageSize, page: pageParam,
            }),
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

import type { DlcDetail, DlcListArgs, DlcListResponse } from "@/domain/dlcs/types";
import { api } from "./api";
import { buildQueryUrl, infinitePaginationOptions } from "./pagination";

export const dlcsAPI = api.injectEndpoints({
    endpoints: builder => ({
        getDlcs: builder.infiniteQuery<DlcListResponse, DlcListArgs, number>({
            infiniteQueryOptions: infinitePaginationOptions<DlcListResponse>(),
            query: ({ queryArg, pageParam }) => buildQueryUrl("/dlcs", {
                filter: queryArg.filter, sort: queryArg.sort, pageSize: queryArg.pageSize, page: pageParam,
            }),
        }),
        getDlcById: builder.query<DlcDetail, string>({ query: id => `/dlcs/${encodeURIComponent(id)}` }),
    }),
});

export const { useGetDlcsInfiniteQuery } = dlcsAPI;
export const useGetDlcQuery = dlcsAPI.useGetDlcByIdQuery;

export const resetDlcPages = (args: DlcListArgs) => dlcsAPI.util.updateQueryData("getDlcs", args, cached => {
    cached.pages.splice(1);
    cached.pageParams.splice(1);
});

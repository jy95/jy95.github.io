import type { ResponseBody, CompanyType, CompanyRole, CompanySort } from "@/app/api/companies/route";
import { api } from "./api";

export const companiesAPI = api.injectEndpoints({
    endpoints: (builder) => ({
        getCompanies: builder.infiniteQuery<ResponseBody, { role: CompanyRole; sort: CompanySort; pageSize: number }, number>({
            infiniteQueryOptions: {
                initialPageParam: 1,
                getNextPageParam: (lastPage, _, lastPageParam) =>
                    lastPageParam < lastPage.total_pages ? lastPageParam + 1 : undefined,
            },
            query: ({ queryArg, pageParam }) =>
                `/companies?${new URLSearchParams({ role: queryArg.role, sort: queryArg.sort, page: String(pageParam), pageSize: String(queryArg.pageSize) })}`,
        }),
        getCompany: builder.query<CompanyType, string>({
            query: (id) => `/companies/${encodeURIComponent(id)}`,
        }),
    })
});

export const { useGetCompaniesInfiniteQuery, useGetCompanyQuery } = companiesAPI;

import type { ResponseBody, CompanyType, CompanyRole, CompanySort } from "@/app/api/companies/route";
import { api } from "./api";
import { buildQueryUrl, infinitePaginationOptions } from "./pagination";

export const companiesAPI = api.injectEndpoints({
    endpoints: (builder) => ({
        getCompanies: builder.infiniteQuery<ResponseBody, { role: CompanyRole; sort: CompanySort; pageSize: number }, number>({
            infiniteQueryOptions: infinitePaginationOptions<ResponseBody>(),
            query: ({ queryArg, pageParam }) => buildQueryUrl("/companies", {
                role: queryArg.role, sort: queryArg.sort, pageSize: queryArg.pageSize, page: pageParam,
            }),
        }),
        getCompany: builder.query<CompanyType, string>({
            query: (id) => `/companies/${encodeURIComponent(id)}`,
        }),
    })
});

export const { useGetCompaniesInfiniteQuery, useGetCompanyQuery } = companiesAPI;

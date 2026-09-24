import type { CompanyType } from "@/app/api/companies/route";
import { api } from "./api"

export const companiesAPI = api.injectEndpoints({
    endpoints: (builder) => ({
        getCompanies: builder.query<CompanyType[], void>({
            query: () => "/companies"
        })
    })
});

export const { useGetCompaniesQuery } = companiesAPI
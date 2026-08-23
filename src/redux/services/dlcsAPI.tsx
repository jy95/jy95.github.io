import type { dlcType } from "@/app/api/dlcs/route";
import { api } from "./api"

export const dlcsAPI = api.injectEndpoints({
    endpoints: (builder) => ({
        getDLCs: builder.query<dlcType[], void>({
            query: () => "/dlcs"
        })
    })
});

export const { useGetDLCsQuery } = dlcsAPI

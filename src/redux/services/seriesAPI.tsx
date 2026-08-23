import type { serieType } from "@/app/api/series/route";
import { api } from "./api"

export const seriesAPI = api.injectEndpoints({
    endpoints: (builder) => ({
        getSeries: builder.query<serieType[], void>({
            query: () => "/series"
        })
    })
});

export const { useGetSeriesQuery } = seriesAPI

import type { statsProperty } from "@/app/api/stats/route";
import { api } from "./api"

export const statsAPI = api.injectEndpoints({
    endpoints: (builder) => ({
        getStats: builder.query<statsProperty, void>({
            query: () => "/stats"
        })
    })
});

export const { useGetStatsQuery } = statsAPI

import type { planningEntry } from "@/app/api/planning/route";
import { api } from "./api"

export const planningAPI = api.injectEndpoints({
    endpoints: (builder) => ({
        getPlanning: builder.query<planningEntry[], void>({
            query: () => "/planning"
        })
    })
});

export const { useGetPlanningQuery } = planningAPI

import type { BacklogEntry } from "@/app/api/backlog/route";
import { api } from "./api"

export const backlogAPI = api.injectEndpoints({
    endpoints: (builder) => ({
        getBacklog: builder.query<BacklogEntry[], void>({
            query: () => "/backlog"
        })
    })
});

export const { useGetBacklogQuery } = backlogAPI

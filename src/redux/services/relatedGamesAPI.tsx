import type { RelatedGamesMap } from "@/domain/discovery/relatedGames";
import { api } from "./api"

export const relatedGamesAPI = api.injectEndpoints({
    endpoints: (builder) => ({
        getRelatedGames: builder.query<RelatedGamesMap, void>({
            query: () => "/related-games"
        })
    })
});

export const { useGetRelatedGamesQuery } = relatedGamesAPI
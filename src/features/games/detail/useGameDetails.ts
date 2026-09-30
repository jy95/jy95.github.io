"use client";

import { useGetGamesInfiniteQuery } from "@/redux/services/gamesAPI";
import { useGetPlanningQuery } from "@/redux/services/planningAPI";
import { useGetBacklogQuery } from "@/redux/services/backlogAPI";

/** Resolve the existing string IDs without introducing another catalogue or API. */
export function useGameDetails(id: string) {
    // The games API supports pageSize=0 to return the complete catalogue.
    const games = useGetGamesInfiniteQuery({ filters: {}, pageSize: 0 });
    const publishedGame = games.data?.pages.flatMap((page) => page.items).find((game) => game.id === id);
    const needsPlanning = games.isSuccess && !publishedGame;
    const planning = useGetPlanningQuery(undefined, { skip: !needsPlanning });
    const plannedGame = needsPlanning ? planning.data?.find((game) => game.id === id) : undefined;
    const needsBacklog = needsPlanning && planning.isSuccess && !plannedGame;
    const backlog = useGetBacklogQuery(undefined, { skip: !needsBacklog });
    const backlogGame = needsBacklog ? backlog.data?.find((game) => game.id === id) : undefined;
    const activeQuery = needsBacklog ? backlog : needsPlanning ? planning : games;

    return {
        data: publishedGame ?? plannedGame ?? backlogGame,
        isPublished: Boolean(publishedGame),
        error: activeQuery.error,
        isLoading: activeQuery.isLoading || activeQuery.isUninitialized,
        isMissing: activeQuery.isSuccess && !publishedGame && !plannedGame && !backlogGame,
        refetch: activeQuery.refetch,
    };
}

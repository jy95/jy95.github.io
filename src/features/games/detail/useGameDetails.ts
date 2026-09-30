"use client";

import { useGetGameDetailsQuery } from "@/redux/services/gamesAPI";

export function useGameDetails(id: string) {
    const query = useGetGameDetailsQuery(id);

    return {
        data: query.currentData,
        error: query.error,
        isLoading: query.isFetching && !query.currentData,
        isMissing: query.isError && "status" in query.error && query.error.status === 404,
        refetch: query.refetch,
    };
}

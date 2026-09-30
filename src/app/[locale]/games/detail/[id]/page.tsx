"use client";

import { use } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { notFound } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { QueryBoundary } from "@/components/common/QueryBoundary";
import GameDetailContent from "@/features/games/detail/GameDetailContent";
import GameToolbar from "@/features/games/detail/GameToolbar";
import { useGameDetails } from "@/features/games/detail/useGameDetails";
import { isCardGame } from "@/features/games/detail/adapters";

export default function GameDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data, error, isLoading, isMissing, isPublished, refetch } = useGameDetails(id);
    const router = useRouter();

    if (isMissing) return notFound();

    function goBack() {
        if (window.history.length > 1) router.back();
        else router.replace("/games");
    }

    return (
        <QueryBoundary error={error} isLoading={isLoading} data={data} onRetry={refetch} loadingFallback={<CircularProgress />}>
            {(game) => <>
                <GameToolbar game={game} onClose={goBack} presentation="page" isPublished={isPublished} />
                <GameDetailContent game={game} showVoteSection={!isCardGame(game)} showRelatedGames={isCardGame(game)} />
            </>}
        </QueryBoundary>
    );
}

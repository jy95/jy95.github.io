"use client";

// Hooks
import { useGetGamesTierListQuery } from "@/redux/services/tierListAPI";

// Custom
import CardEntry from "@/features/games/components/CardEntry";
import { TierLists } from "@/components/tierList";
import { QueryBoundary } from "@/components/common/QueryBoundary";

// Types 
import type { CardGame } from "@/domain/games";

const GameCardRenderer = ({ game }: { game: CardGame }) => <CardEntry game={game} />;

export default function GamesTierList() {

    const { data, isLoading, error, refetch } = useGetGamesTierListQuery();

    return (
        <QueryBoundary
            error={error}
            isLoading={isLoading}
            data={data}
            onRetry={refetch}
            loadingFallback={(
                <TierLists
                    data={data}
                    isLoadingData={isLoading}
                    GameRender={GameCardRenderer}
                />
            )}
        >
            {(data) => (
                <TierLists 
                    data={data}
                    isLoadingData={isLoading}
                    GameRender={GameCardRenderer}
                />
            )}
        </QueryBoundary>
    );
}

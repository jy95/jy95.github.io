"use client";

// Hooks
import { useGetGamesTierListQuery } from "@/redux/services/tierListAPI";

// Custom
import CardEntry from "@/components/GamesView/CardEntry";
import { TierLists } from "@/components/tierList";

export default function GamesTierList() {

    const { data, isLoading } = useGetGamesTierListQuery();

    return (
        <TierLists 
            data={data}
            isLoadingData={isLoading}
            GameRender={({ game }) => <CardEntry  game={game} />}
        />
    );
}
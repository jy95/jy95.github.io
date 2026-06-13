"use client";

// Hooks
import { useGetBacklogTierListQuery } from "@/redux/services/tierListAPI";

// UI
import BaseCard from "@/components/GamesView/BaseCard";
import { TierLists } from "@/components/tierList";

// Types
import type { BacklogEntry } from "@/app/api/backlog/route";

const BacklogCardRenderer = ({ game }: { game: BacklogEntry }) => <BaseCard item={game} />;

export default function BacklogTierList() {

    const { data, isLoading } = useGetBacklogTierListQuery();

    return (
        <TierLists 
            data={data}
            isLoadingData={isLoading}
            GameRender={BacklogCardRenderer}
        />
    );

}
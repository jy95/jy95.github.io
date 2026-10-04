"use client";

// Hooks
import { useGetBacklogTierListQuery } from "@/redux/services/tierListAPI";

// UI
import SelectionButton from "@/features/selection/components/SelectionButton";
import BaseCard from "@/features/games/components/BaseCard";
import { TierLists } from "@/components/tierList";

// Types
import type { BacklogEntry } from "@/app/api/backlog/route";

const BacklogCardRenderer = ({ game }: { game: BacklogEntry }) => <BaseCard item={game} actionsSlot={item => <SelectionButton id={item.id} category="backlog" title={item.title} />} />;

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
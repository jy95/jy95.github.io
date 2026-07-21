"use client";

// Hooks
import { useGetTestsTierListQuery } from "@/redux/services/tierListAPI";

// Custom
import CardEntry from "@/components/GamesView/CardEntry";
import { TierLists } from "@/components/tierList";

// Types 
import type { CardGame } from "@/redux/sharedDefintion";

const GameCardRenderer = ({ game }: { game: CardGame }) => <CardEntry game={game} />;

export default function GamesTierList() {

    const { data, isLoading } = useGetTestsTierListQuery();

    return (
        <TierLists 
            data={data}
            isLoadingData={isLoading}
            GameRender={GameCardRenderer}
        />
    );
}
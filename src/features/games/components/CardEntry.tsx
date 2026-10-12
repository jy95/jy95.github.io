"use client";

// Hooks
import { useRouter } from '@/i18n/routing';

// Reusable functions
import { buildWatchRoute } from "@/domain/games/youtube";

// UI
import BaseCard from "./BaseCard";
import CardEntryActions from "./CardEntryActions";
import GameCardOverlay from "./GameCardOverlay";

// Types
import type { ReactNode } from "react";
import type { CardGame } from "@/domain/games";
import type { SelectionCategory } from '@/domain/selection/types';

type CardProps = {
    game: CardGame; 
    selectable?: boolean; 
    badge?: ReactNode; 
    category?: SelectionCategory;
    showDetails?: boolean
}

function CardEntry({ 
    game, 
    selectable = true,
    showDetails = true,
    badge, 
    category = "games" 
}: CardProps) {

    // hooks
    const router = useRouter();

    return (
        <BaseCard 
            item={game}
            badgesSlot={badge ? () => badge : undefined}
            onClick={(item) => router.push(buildWatchRoute(item.url_type, item.id))}
            actionsSlot={selectable || showDetails ? (item) => (
                <CardEntryActions game={item} selectable={selectable} showDetails={showDetails} category={category} />
            ) : undefined}
            overlaySlot={(item) => <GameCardOverlay game={item} />}
        />
    );
}

export default CardEntry;

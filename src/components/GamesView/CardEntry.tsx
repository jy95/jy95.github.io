"use client";

// Hooks
import { useRouter } from '@/i18n/routing';

// UI
import BaseCard from "./BaseCard";

// Types
import type { CardGame } from "@/redux/sharedDefintion";

function CardEntry(props : {
    game: CardGame;
}) {

    // hooks
    const router = useRouter();

    // props
    const {game} = props;
    
    // consts
    const {
        url_type,
        id: gameId
    } = game;

    function watchGame() {
        router.push({
            pathname: url_type === "PLAYLIST" ? "/playlist/[id]" : "/video/[id]",
            params: { id: gameId }
        });
    }

    return (
        <BaseCard 
            item={game}
            onClick={() => watchGame()}
        />
    );
}

export default CardEntry;
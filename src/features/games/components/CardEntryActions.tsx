import SelectionButton from "@/features/selection/components/SelectionButton";

import GameDetailsButton from "./GameDetailsButton";

import type { CardGame } from "@/domain/games";
import type { SelectionCategory } from "@/domain/selection/types";

type Props = {
    game: CardGame;
    selectable: boolean;
    showDetails: boolean;
    category: SelectionCategory;
};

export default function CardEntryActions({ game, selectable, showDetails, category }: Props) {
    return (
        <>
            {selectable && <SelectionButton id={game.id} category={category} title={game.title} />}
            {showDetails && <GameDetailsButton id={game.id} title={game.title} />}
        </>
    );
}

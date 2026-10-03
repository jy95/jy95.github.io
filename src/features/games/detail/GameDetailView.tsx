"use client";

import type { SelectionCategory } from '@/features/selection/selectionDocument';
import { useState } from "react";
import Dialog from '@mui/material/Dialog';
import GameToolbar from "./GameToolbar";
import GameDetailContent from "./GameDetailContent";
import type { RawGameDetailsEntry } from "./adapters";

interface GameDetailViewProps {
    game: RawGameDetailsEntry;
    category?: SelectionCategory;
    onClose: () => void;
    showVoteSection?: boolean;
    showRelatedGames?: boolean;
}

export default function GameDetailView({ game, onClose, category, ...contentProps }: GameDetailViewProps) {
    const [open, setOpen] = useState(true);

    function handleClose() {
        setOpen(false);
        onClose();
    }

    return (
        <Dialog fullScreen open={open} onClose={handleClose}>
            <GameToolbar category={category} game={game} onClose={handleClose} />
            <GameDetailContent game={game} {...contentProps} />
        </Dialog>
    );
}

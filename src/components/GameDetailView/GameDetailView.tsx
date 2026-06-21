"use client";

import { useState } from "react";
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';

// Components
import GameToolbar from "./GameToolbar";
import GameGenres from './GameGenres';
import VoteSection from "./VoteSection";
import { CardMediaImage } from '../GamesView/CardMediaImage';

// Dynamic Rows Registry
import { DETAIL_ROWS } from "./rows";

// Types & Utils
import { hasGenres } from "./utils";
import type { GameDetailsEntry } from "./types";

interface GameDetailViewProps {
    game: GameDetailsEntry;
    onClose: () => void;
    /** @default true */
    showVoteSection?: boolean;
}

export default function GameDetailView({ game, onClose, showVoteSection = true }: GameDetailViewProps) {
    const [open, setOpen] = useState(true);

    function handleClose() {
        setOpen(false);
        onClose();
    }

    return (
        <Dialog fullScreen open={open} onClose={handleClose}>
            <GameToolbar game={game} onClose={handleClose} />

            <Box sx={{ p: { xs: 2, md: 5 }, flexGrow: 1 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ alignItems: 'flex-start' }}>
                    
                    {/* --- Cover --- */}
                    <Box sx={{ width: { xs: '100%', md: 280 }, maxWidth: { xs: 340, md: 'none' }, mx: { xs: 'auto', md: 0 }, flexShrink: 0, mb: 2 }}>
                        <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                            <CardMediaImage src={game.imagePath} alt={game.title} ratio="portrait" objectFit="cover" />
                        </Paper>
                    </Box>

                    {/* --- Details --- */}
                    <Box sx={{ flex: 1, width: '100%' }}>
                        {showVoteSection && (
                            <>
                                <VoteSection slug={game.id} />
                                <Divider sx={{ mb: 3 }} />
                            </>
                        )}

                        {hasGenres(game) && (
                            <>
                                <GameGenres genreIds={game.genres} />
                                <Divider sx={{ mb: 3 }} />
                            </>
                        )}

                        {/* --- Fini les IF ! On boucle sur les composants autonomes --- */}
                        <Stack spacing={3}>
                            {DETAIL_ROWS.map((RowComponent, index) => (
                                <RowComponent key={index} game={game} />
                            ))}
                        </Stack>
                    </Box>

                </Stack>
            </Box>
        </Dialog>
    );
}
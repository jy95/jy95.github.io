"use client";

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';

// Components
import GameGenres from './GameGenres';
import VoteSection from "./VoteSection";
import { CardMediaImage } from '@/components/common/CardMediaImage';
import RelatedGames from '@/features/games/components/RelatedGames';

// Dynamic Rows Registry
import { DETAIL_ROWS } from "./rows";

// Types & Utils
import { hasGenres } from "./predicates";
import { toGameDetailsEntry } from "./adapters";
import type { RawGameDetailsEntry } from "./adapters";

interface GameDetailContentProps {
    game: RawGameDetailsEntry;
    /** @default true */
    showVoteSection?: boolean;
    /** @default false */
    showRelatedGames?: boolean;
}

export default function GameDetailContent({
    game: rawGame,
    showVoteSection = true,
    showRelatedGames = false,
}: GameDetailContentProps) {
    const game = toGameDetailsEntry(rawGame);

    return (
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

                    {/* --- Detail Rows */}
                    <Stack spacing={3}>
                        {DETAIL_ROWS.map((RowComponent, index) => (
                            <RowComponent key={index} game={game} />
                        ))}
                    </Stack>
                </Box>

            </Stack>
            {showRelatedGames && (
                <RelatedGames
                    key={game.id}
                    gameId={game.id}
                />
            )}
        </Box>
    );
}
